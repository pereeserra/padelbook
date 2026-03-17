import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function RegisterPage() {
  const navigate = useNavigate();
  const feedbackRef = useRef(null);

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 900);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 900);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!error || !feedbackRef.current) return;

    const top =
      feedbackRef.current.getBoundingClientRect().top + window.scrollY - 120;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  }, [error]);

  const normalizeSpaces = (value) => value.trim().replace(/\s+/g, " ");

  const passwordChecks = useMemo(() => {
    return {
      minLength: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
      match: !!confirmPassword && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const completedPasswordChecks = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrengthText =
    completedPasswordChecks <= 2
      ? "Baixa"
      : completedPasswordChecks <= 4
      ? "Mitjana"
      : "Alta";

  const validateForm = () => {
    const cleanNom = normalizeSpaces(nom);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanNom || !cleanEmail || !password.trim() || !confirmPassword.trim()) {
      return "Has d'omplir tots els camps.";
    }

    if (cleanNom.length < 5) {
      return "El nom complet ha de tenir almenys 5 caràcters.";
    }

    const words = cleanNom.split(" ").filter(Boolean);
    if (words.length < 2) {
      return "Has d'introduir com a mínim nom i llinatge.";
    }

    const emailRegex = /^[^\s@]{2,}@[^\s@]{2,}\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return "Introdueix un correu electrònic vàlid.";
    }

    if (password.length < 8) {
      return "La contrasenya ha de tenir almenys 8 caràcters.";
    }

    if (!/[a-z]/.test(password)) {
      return "La contrasenya ha d'incloure almenys una lletra minúscula.";
    }

    if (!/[A-Z]/.test(password)) {
      return "La contrasenya ha d'incloure almenys una lletra majúscula.";
    }

    if (!/[0-9]/.test(password)) {
      return "La contrasenya ha d'incloure almenys un número.";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return "La contrasenya ha d'incloure almenys un símbol.";
    }

    if (password !== confirmPassword) {
      return "Les contrasenyes no coincideixen.";
    }

    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");
      setLoading(true);

      const cleanNom = normalizeSpaces(nom);
      const cleanEmail = email.trim().toLowerCase();

      await api.post("/auth/register", {
        nom: cleanNom,
        email: cleanEmail,
        password,
      });

      navigate("/login");
    } catch (err) {
      console.error(err);

      const backendError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "";

      const normalizedError = backendError.toString().toLowerCase();

      if (
        normalizedError.includes("email") ||
        normalizedError.includes("correu") ||
        normalizedError.includes("duplicate") ||
        normalizedError.includes("duplicat") ||
        normalizedError.includes("exists") ||
        normalizedError.includes("exist") ||
        normalizedError.includes("already") ||
        normalizedError.includes("registrat") ||
        normalizedError.includes("usuari ja existeix")
      ) {
        setError("Aquest correu electrònic ja està registrat.");
      } else {
        setError("No s'ha pogut crear el compte. Revisa les dades o prova amb un altre correu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCapsLock = (e) => {
    setCapsLock(e.getModifierState("CapsLock"));
  };

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.wrapper,
          ...(isMobileView ? styles.wrapperMobile : {}),
        }}
      >
        <section
          className="fade-in-up"
          style={{
            ...styles.visualPanel,
            ...(isMobileView ? styles.visualPanelMobile : {}),
          }}
        >
          <div style={styles.visualGlowOne} />
          <div style={styles.visualGlowTwo} />

          <div style={styles.visualContent}>
            <span style={styles.badge}>Nou compte</span>

            <h1
              style={{
                ...styles.title,
                ...(isMobileView ? styles.titleMobile : {}),
              }}
            >
              Crea el teu compte i comença a explorar PadelBook
            </h1>

            <p style={styles.text}>
              Registra’t per reservar pistes, consultar disponibilitat i gestionar
              les teves reserves dins una experiència més moderna i agradable.
            </p>

            <div style={styles.benefitGrid}>
              <div style={styles.benefitCard}>
                <span style={styles.benefitIcon}>⚡</span>
                <strong style={styles.benefitTitle}>Accés ràpid</strong>
                <p style={styles.benefitText}>
                  Entra i comença a utilitzar la plataforma en pocs segons.
                </p>
              </div>

              <div style={styles.benefitCard}>
                <span style={styles.benefitIcon}>🎾</span>
                <strong style={styles.benefitTitle}>Reserva fàcil</strong>
                <p style={styles.benefitText}>
                  Consulta pistes i gestiona el teu historial sense complicacions.
                </p>
              </div>

              <div style={styles.benefitCard}>
                <span style={styles.benefitIcon}>🔒</span>
                <strong style={styles.benefitTitle}>Compte segur</strong>
                <p style={styles.benefitText}>
                  Crea una contrasenya robusta amb ajuda visual en temps real.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="scale-in delay-1"
          style={{
            ...styles.formCard,
            ...(isMobileView ? styles.formCardMobile : {}),
          }}
        >
          <div style={styles.formTop}>
            <span style={styles.formKicker}>Registre</span>
            <h2 style={styles.formTitle}>Crear compte</h2>
            <p style={styles.formText}>
              Omple el formulari i comença a utilitzar la plataforma.
            </p>
          </div>

          <div ref={feedbackRef} />

          {error && (
            <div className="scale-in" style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.field}>
              <label htmlFor="nom" style={styles.label}>
                Nom i llinatges
              </label>

              <input
                id="nom"
                type="text"
                placeholder="Ex: Pere Serra"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="email" style={styles.label}>
                Correu electrònic
              </label>

              <input
                id="email"
                type="email"
                placeholder="exemple@correu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="password" style={styles.label}>
                Contrasenya
              </label>

              <div
                style={{
                  ...styles.passwordWrapper,
                  ...(isMobileView ? styles.passwordWrapperMobile : {}),
                }}
              >
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínim 8 caràcters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleCapsLock}
                  onKeyDown={handleCapsLock}
                  style={styles.input}
                  required
                />

                <button
                  type="button"
                  style={{
                    ...styles.showButton,
                    ...(isMobileView ? styles.showButtonMobile : {}),
                  }}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              {capsLock && (
                <span style={styles.capsWarning}>
                  ⚠️ Tens el bloqueig de majúscules activat
                </span>
              )}
            </div>

            <div style={styles.field}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirmar contrasenya
              </label>

              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repeteix la contrasenya"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.passwordPanel}>
              <div style={styles.passwordPanelHeader}>
                <span style={styles.passwordPanelTitle}>Requisits de la contrasenya</span>

                <span
                  style={{
                    ...styles.passwordStrengthBadge,
                    ...(completedPasswordChecks >= 5
                      ? styles.passwordStrengthGood
                      : completedPasswordChecks >= 3
                      ? styles.passwordStrengthMedium
                      : styles.passwordStrengthLow),
                  }}
                >
                  Seguretat: {passwordStrengthText}
                </span>
              </div>

              <div style={styles.passwordChecklist}>
                <div style={styles.passwordChecklistItem}>
                  <span style={passwordChecks.minLength ? styles.checkOk : styles.checkPending}>
                    {passwordChecks.minLength ? "✓" : "•"}
                  </span>
                  <span>Almenys 8 caràcters</span>
                </div>

                <div style={styles.passwordChecklistItem}>
                  <span style={passwordChecks.lowercase ? styles.checkOk : styles.checkPending}>
                    {passwordChecks.lowercase ? "✓" : "•"}
                  </span>
                  <span>Inclou una minúscula</span>
                </div>

                <div style={styles.passwordChecklistItem}>
                  <span style={passwordChecks.uppercase ? styles.checkOk : styles.checkPending}>
                    {passwordChecks.uppercase ? "✓" : "•"}
                  </span>
                  <span>Inclou una majúscula</span>
                </div>

                <div style={styles.passwordChecklistItem}>
                  <span style={passwordChecks.number ? styles.checkOk : styles.checkPending}>
                    {passwordChecks.number ? "✓" : "•"}
                  </span>
                  <span>Inclou un número</span>
                </div>

                <div style={styles.passwordChecklistItem}>
                  <span style={passwordChecks.symbol ? styles.checkOk : styles.checkPending}>
                    {passwordChecks.symbol ? "✓" : "•"}
                  </span>
                  <span>Inclou un símbol</span>
                </div>

                <div style={styles.passwordChecklistItem}>
                  <span style={passwordChecks.match ? styles.checkOk : styles.checkPending}>
                    {passwordChecks.match ? "✓" : "•"}
                  </span>
                  <span>Les dues contrasenyes coincideixen</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? "Creant compte..." : "Crear compte"}
            </button>
          </form>

          <div style={styles.separator}>
            <span style={styles.separatorLine} />
            <span style={styles.separatorText}>o</span>
            <span style={styles.separatorLine} />
          </div>

          <div style={styles.footerBox}>
            <p style={styles.footerText}>Ja tens compte?</p>

            <Link to="/login" className="btn btn-light btn-full">
              Iniciar sessió
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 80px)",
    padding: "2rem 1rem 3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  wrapper: {
    width: "100%",
    maxWidth: "1180px",
    display: "grid",
    gridTemplateColumns: "1.02fr 0.98fr",
    gap: "1.4rem",
    alignItems: "stretch",
  },

  wrapperMobile: {
    gridTemplateColumns: "1fr",
  },

  visualPanel: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "30px",
    padding: "2rem",
    background:
      "linear-gradient(135deg, rgba(16,185,129,0.92), rgba(37,99,235,0.9))",
    boxShadow: "0 26px 56px rgba(37,99,235,0.16)",
    minHeight: "720px",
    display: "flex",
    alignItems: "center",
  },

  visualPanelMobile: {
    minHeight: "unset",
    padding: "1.25rem",
    borderRadius: "24px",
  },

  visualGlowOne: {
    position: "absolute",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    top: "-50px",
    right: "-30px",
  },

  visualGlowTwo: {
    position: "absolute",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background: "rgba(15,23,42,0.12)",
    bottom: "-60px",
    left: "-40px",
  },

  visualContent: {
    position: "relative",
    zIndex: 2,
    width: "100%",
  },

  badge: {
    display: "inline-block",
    padding: "0.5rem 0.85rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "white",
    fontWeight: "800",
    marginBottom: "1rem",
  },

  title: {
    color: "white",
    marginBottom: "1rem",
    maxWidth: "620px",
    fontSize: "3.1rem",
    lineHeight: 1.02,
  },

  titleMobile: {
    fontSize: "2.2rem",
  },

  text: {
    color: "rgba(255,255,255,0.86)",
    marginBottom: "1.5rem",
    maxWidth: "620px",
    fontSize: "1.03rem",
  },

  benefitGrid: {
    display: "grid",
    gap: "0.95rem",
  },

  benefitCard: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "20px",
    padding: "1rem",
    backdropFilter: "blur(10px)",
  },

  benefitIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.16)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.15rem",
    marginBottom: "0.75rem",
  },

  benefitTitle: {
    display: "block",
    color: "white",
    marginBottom: "0.3rem",
    fontSize: "1rem",
  },

  benefitText: {
    margin: 0,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.6,
    fontSize: "0.95rem",
  },

  formCard: {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "30px",
    padding: "2rem",
    boxShadow: "0 22px 48px rgba(15,23,42,0.08)",
    backdropFilter: "blur(14px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  formCardMobile: {
    padding: "1.25rem",
    borderRadius: "24px",
  },

  formTop: {
    marginBottom: "1.2rem",
  },

  formKicker: {
    display: "inline-block",
    marginBottom: "0.7rem",
    padding: "0.42rem 0.75rem",
    borderRadius: "999px",
    background: "rgba(16,185,129,0.12)",
    color: "#047857",
    fontWeight: "800",
    fontSize: "0.82rem",
  },

  formTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "2rem",
  },

  formText: {
    marginTop: "0.55rem",
    marginBottom: 0,
    color: "#64748b",
  },

  errorBox: {
    marginBottom: "1rem",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "16px",
    padding: "0.95rem 1rem",
  },

  errorText: {
    margin: 0,
    color: "#be123c",
    fontWeight: "700",
    lineHeight: 1.6,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },

  label: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: "0.95rem",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    padding: "1rem 1rem",
    background: "rgba(255,255,255,0.94)",
    fontSize: "1rem",
    color: "#0f172a",
    outline: "none",
  },

  passwordWrapper: {
    display: "flex",
    gap: "0.55rem",
    alignItems: "stretch",
  },

  passwordWrapperMobile: {
    flexDirection: "column",
  },

  showButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    padding: "0 1rem",
    background: "white",
    cursor: "pointer",
    fontWeight: "700",
    minWidth: "110px",
    color: "#334155",
  },

  showButtonMobile: {
    width: "100%",
    minHeight: "46px",
  },

  capsWarning: {
    color: "#b91c1c",
    fontSize: "0.85rem",
    fontWeight: "700",
  },

  passwordPanel: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },

  passwordPanelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.8rem",
    flexWrap: "wrap",
  },

  passwordPanelTitle: {
    fontSize: "0.92rem",
    fontWeight: "800",
    color: "#0f172a",
  },

  passwordStrengthBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.35rem 0.72rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "800",
  },

  passwordStrengthLow: {
    background: "#fff1f2",
    color: "#be123c",
    border: "1px solid #fecdd3",
  },

  passwordStrengthMedium: {
    background: "#fff7ed",
    color: "#c2410c",
    border: "1px solid #fdba74",
  },

  passwordStrengthGood: {
    background: "#ecfdf5",
    color: "#15803d",
    border: "1px solid #86efac",
  },

  passwordChecklist: {
    display: "grid",
    gap: "0.55rem",
  },

  passwordChecklistItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    color: "#334155",
    fontSize: "0.92rem",
    lineHeight: 1.5,
  },

  checkOk: {
    display: "inline-flex",
    width: "20px",
    justifyContent: "center",
    color: "#15803d",
    fontWeight: "800",
  },

  checkPending: {
    display: "inline-flex",
    width: "20px",
    justifyContent: "center",
    color: "#94a3b8",
    fontWeight: "800",
  },

  separator: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    margin: "1.2rem 0 1rem",
  },

  separatorLine: {
    flex: 1,
    height: "1px",
    background: "#e2e8f0",
  },

  separatorText: {
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: "0.9rem",
  },

  footerBox: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },

  footerText: {
    margin: 0,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "600",
  },
};

export default RegisterPage;