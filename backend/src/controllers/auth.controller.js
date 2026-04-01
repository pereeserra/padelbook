const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../services/email.service");

const { ok, message, fail } = require("../utils/response");
const { verifyTurnstileToken } = require("../services/turnstile.service");
const { logSecurityEvent } = require("../utils/securityLogger");

const {
  normalizeEmail,
  normalizeFullName,
  validatePasswordStrength,
  validateProfileData,
} = require("../utils/validators");

const buildVerificationEmailHtml = ({ nom, verifyUrl }) => `
  <h2>Verificació de correu</h2>
  <p>Hola ${nom},</p>
  <p>Fes clic al següent enllaç per verificar el teu compte:</p>
  <a href="${verifyUrl}" target="_blank">${verifyUrl}</a>
  <p>Aquest enllaç caduca en 24 hores.</p>
`;


// REGISTRE D'USUARI
exports.register = async (req, res) => {
  try {
    let { nom, llinatges, email, password, turnstileToken } = req.body;

    nom = normalizeFullName(nom);
    llinatges = normalizeFullName(llinatges);
    email = normalizeEmail(email);
    password = typeof password === "string" ? password : "";

    const profileValidation = validateProfileData(nom, llinatges, email);
    if (profileValidation.error) {
      return fail(res, profileValidation.error, 400);
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return fail(res, passwordError, 400);
    }

    const turnstileResult = await verifyTurnstileToken({
      token: turnstileToken,
      remoteip: req.ip,
    });

    if (!turnstileResult.success) {
      logSecurityEvent(req, "REGISTER_TURNSTILE_FAILED", {
        email,
        reason: turnstileResult.message,
      });

      return fail(res, turnstileResult.message, 400);
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      logSecurityEvent(req, "REGISTER_DUPLICATE_EMAIL", {
        email,
      });

      return fail(res, "Aquest correu electrònic ja està registrat.", 409);
    }

    const hash = await bcrypt.hash(password, 10);

    const [insertResult] = await db.query(
      "INSERT INTO users (nom, llinatges, email, password_hash, rol, email_verificat) VALUES (?, ?, ?, ?, 'usuari', 0)",
      [nom, llinatges, email, hash]
    );

    logSecurityEvent(req, "REGISTER_SUCCESS", {
      createdUserId: insertResult.insertId,
      email,
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await db.query(
      "INSERT INTO verification_codes (user_id, code, type, expires_at) VALUES (?, ?, 'email_verification', DATE_ADD(NOW(), INTERVAL 24 HOUR))",
      [insertResult.insertId, verificationToken]
    );

    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: email,
      subject: "Verifica el teu compte - PadelBook",
      html: buildVerificationEmailHtml({ nom, verifyUrl }),
    });

    return message(res, "Usuari registrat. Revisa el teu correu per verificar el compte.", 201);

  } catch (error) {
    console.error("Error al registre:", error);

    logSecurityEvent(req, "REGISTER_SERVER_ERROR", {
      email: typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : null,
      errorMessage: error.message,
    });

    if (error.code === "ER_DUP_ENTRY") {
      return fail(res, "Aquest correu electrònic ja està registrat.", 409);
    }

    return fail(res, "Error intern del servidor durant el registre.", 500);
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    let { email, password, turnstileToken } = req.body;

    email = normalizeEmail(email);
    password = typeof password === "string" ? password : "";

    if (!email || !password) {
      return fail(res, "Has d'introduir email i contrasenya.", 400);
    }

    if (turnstileToken) {
      const turnstileResult = await verifyTurnstileToken({
        token: turnstileToken,
        remoteip: req.ip,
      });

      if (!turnstileResult.success) {
        logSecurityEvent(req, "LOGIN_TURNSTILE_FAILED", {
          email,
          reason: turnstileResult.message,
        });

        return fail(res, turnstileResult.message, 400);
      }
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      logSecurityEvent(req, "LOGIN_FAILED", {
        email,
        reason: "invalid_credentials",
      });

      return fail(res, "Credencials incorrectes", 401);
    }

    const user = rows[0];

    if (user.email_verificat === 0) {
      return fail(res, "Has de verificar el teu correu abans d'iniciar sessió.", 403);
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      logSecurityEvent(req, "LOGIN_FAILED", {
        email,
        attemptedUserId: user.id,
        reason: "invalid_credentials",
      });

      return fail(res, "Credencials incorrectes", 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        rol: user.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    logSecurityEvent(req, "LOGIN_SUCCESS", {
      userId: user.id,
      rol: user.rol,
      email,
    });

    return message(res, "Login correcte", 200, {
      token,
      user: {
        id: user.id,
        nom: user.nom,
        llinatges: user.llinatges,
        email: user.email,
        rol: user.rol,
        telefon: user.telefon,
        email_verificat: user.email_verificat,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error("Error al login:", error);

    logSecurityEvent(req, "LOGIN_SERVER_ERROR", {
      email: typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : null,
      errorMessage: error.message,
    });

    return fail(res, "No s'ha pogut iniciar sessió", 500);
    }
};

// OBTENIR DADES DE L'USUARI AUTENTICAT
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT id, nom, llinatges, email, rol, telefon, email_verificat, created_at FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      return fail(res, "Usuari no trobat", 404);
    }

    return ok(res, rows[0]);

  } catch (error) {
    console.error("Error getMe:", error);
    return fail(res, "Error obtenint les dades de l'usuari");
  }
};

// ACTUALITZAR PERFIL
exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.id;

    let { nom, llinatges, email } = req.body;

    nom = normalizeFullName(nom);
    email = normalizeEmail(email);

    const profileValidation = validateProfileData(nom, llinatges, email);
    if (profileValidation.error) {
      return fail(res, profileValidation.error, 400);
    }

    const [currentUsers] = await db.query(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (currentUsers.length === 0) {
      return fail(res, "Usuari no trobat.", 404);
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
      [email, userId]
    );

    if (existingUsers.length > 0) {
      return fail(
        res,
        "Aquest correu electrònic ja està registrat per un altre usuari.",
        409
      );
    }

    await db.query(
      "UPDATE users SET nom = ?, llinatges = ?, email = ? WHERE id = ?",
      [nom, llinatges, email, userId]
    );

    const [updatedRows] = await db.query(
      "SELECT id, nom, llinatges, email, rol, telefon, email_verificat, created_at FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    return message(res, "Perfil actualitzat correctament", 200, updatedRows[0]);

  } catch (error) {
    console.error("Error updateMe:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return fail(
        res,
        "Aquest correu electrònic ja està registrat per un altre usuari.",
        409
      );
    }

    return fail(res, "Error actualitzant el perfil");
  }
};

// CANVIAR CONTRASENYA
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    let { currentPassword, newPassword } = req.body;

    currentPassword =
      typeof currentPassword === "string" ? currentPassword : "";

    newPassword =
      typeof newPassword === "string" ? newPassword : "";

    if (!currentPassword || !newPassword) {
      return fail(
        res,
        "Has d'introduir la contrasenya actual i la nova contrasenya.",
        400
      );
    }

    if (currentPassword === newPassword) {
      return fail(
        res,
        "La nova contrasenya no pot ser igual que l'actual.",
        400
      );
    }

    const passwordError = validatePasswordStrength(newPassword);

    if (passwordError) {
      return fail(
        res,
        passwordError.replace("La contrasenya", "La nova contrasenya"),
        400
      );
    }

    const [rows] = await db.query(
      "SELECT id, password_hash FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      return fail(res, "Usuari no trobat.", 404);
    }

    const user = rows[0];

    const match = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!match) {
      return fail(res, "La contrasenya actual no és correcta.", 401);
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [newHash, userId]
    );

    return message(res, "Contrasenya actualitzada correctament.");

  } catch (error) {
    console.error("Error changePassword:", error);
    return fail(res, "Error canviant la contrasenya.");
  }
};

// VERIFICAR EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return fail(res, "Token no proporcionat.", 400);
    }

    const [rows] = await db.query(
      "SELECT * FROM verification_codes WHERE code = ? AND type = 'email_verification' LIMIT 1",
      [token]
    );

    if (rows.length === 0) {
      return fail(res, "Token invàlid o expirat.", 400);
    }

    const verification = rows[0];

    if (new Date(verification.expires_at) < new Date()) {
      return fail(res, "Token invàlid o expirat.", 400);
    }

    const [userRows] = await db.query(
      "SELECT id, email_verificat FROM users WHERE id = ? LIMIT 1",
      [verification.user_id]
    );

    if (userRows.length === 0) {
      return fail(res, "Usuari no trobat.", 404);
    }

    if (userRows[0].email_verificat === 1) {
      return message(res, "Aquest compte ja estava verificat.");
    }

    await db.query(
      "UPDATE users SET email_verificat = 1 WHERE id = ?",
      [verification.user_id]
    );

    return message(res, "Compte verificat correctament.");
  } catch (error) {
    console.error("Error verifyEmail:", error);
    return fail(res, "Error verificant el compte.");
  }
};

// REENVIAR VERIFICACIÓ D'EMAIL
exports.resendVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT id, nom, email, email_verificat FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      return fail(res, "Usuari no trobat.", 404);
    }

    const user = rows[0];

    if (user.email_verificat === 1) {
      return fail(res, "Aquest compte ja està verificat.", 400);
    }

    await db.query(
      "DELETE FROM verification_codes WHERE user_id = ? AND type = 'email_verification'",
      [userId]
    );

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await db.query(
      "INSERT INTO verification_codes (user_id, code, type, expires_at) VALUES (?, ?, 'email_verification', DATE_ADD(NOW(), INTERVAL 24 HOUR))",
      [userId, verificationToken]
    );

    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Torna a verificar el teu compte - PadelBook",
      html: buildVerificationEmailHtml({ nom: user.nom, verifyUrl }),
    });

    return message(res, "T'hem reenviat el correu de verificació.");
  } catch (error) {
    console.error("Error resendVerification:", error);
    return fail(res, "No s'ha pogut reenviar el correu de verificació.");
  }
};