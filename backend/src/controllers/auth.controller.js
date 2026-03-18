const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { ok, message, fail } = require("../utils/response");

const {
  normalizeEmail,
  normalizeFullName,
  isValidEmail,
  hasMinFullNameLength,
  hasNameAndSurname,
  validatePasswordStrength,
} = require("../utils/validators");


// REGISTRE D'USUARI
exports.register = async (req, res) => {
  try {
    let { nom, email, password } = req.body;

    nom = normalizeFullName(nom);
    email = normalizeEmail(email);
    password = typeof password === "string" ? password : "";

    if (!nom || !email || !password) {
      return fail(res, "Has d'omplir tots els camps.", 400);
    }

    if (!hasMinFullNameLength(nom)) {
      return fail(res, "El nom complet ha de tenir almenys 5 caràcters.", 400);
    }

    if (!hasNameAndSurname(nom)) {
      return fail(res, "Has d'introduir com a mínim nom i llinatge.", 400);
    }

    if (!isValidEmail(email)) {
      return fail(res, "Introdueix un correu electrònic vàlid.", 400);
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return fail(res, passwordError, 400);
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      return fail(res, "Aquest correu electrònic ja està registrat.", 409);
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (nom, email, password_hash, rol) VALUES (?, ?, ?, 'usuari')",
      [nom, email, hash]
    );

    return message(res, "Usuari registrat correctament", 201);

  } catch (error) {
    console.error("Error al registre:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return fail(res, "Aquest correu electrònic ja està registrat.", 409);
    }

    return fail(res, "Error intern del servidor durant el registre.");
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = normalizeEmail(email);
    password = typeof password === "string" ? password : "";

    if (!email || !password) {
      return fail(res, "Has d'introduir email i contrasenya.", 400);
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return fail(res, "Usuari no trobat", 401);
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return fail(res, "Contrasenya incorrecta", 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        rol: user.rol,
        nom: user.nom,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return message(res, "Login correcte", 200, {
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        rol: user.rol,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error("Error al login:", error);
    return fail(res, "Error login");
  }
};

// OBTENIR DADES DE L'USUARI AUTENTICAT
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT id, nom, email, rol, created_at FROM users WHERE id = ? LIMIT 1",
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

    let { nom, email } = req.body;

    nom = normalizeFullName(nom);
    email = normalizeEmail(email);

    if (!nom || !email) {
      return fail(res, "Has d'omplir nom i correu electrònic.", 400);
    }

    if (!hasMinFullNameLength(nom)) {
      return fail(res, "El nom complet ha de tenir almenys 5 caràcters.", 400);
    }

    if (!hasNameAndSurname(nom)) {
      return fail(res, "Has d'introduir com a mínim nom i llinatge.", 400);
    }

    if (!isValidEmail(email)) {
      return fail(res, "Introdueix un correu electrònic vàlid.", 400);
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
      "UPDATE users SET nom = ?, email = ? WHERE id = ?",
      [nom, email, userId]
    );

    const [updatedRows] = await db.query(
      "SELECT id, nom, email, rol, created_at FROM users WHERE id = ? LIMIT 1",
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