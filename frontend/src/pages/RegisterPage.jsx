import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function RegisterPage() {
  const navigate = useNavigate();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

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
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const normalizeSpaces = (value) => value.trim().replace(/\s+/g, " ");

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
            ...styles.infoPanel,
            ...(isMobileView ? styles.infoPanelMobile : {}),
          }}
        >
          <span style={styles.badge}>Crear compte</span>

          <h1
            style={{
              ...styles.title,
              ...(isMobileView ? styles.titleMobile : {}),
            }}
          >
            Registra't a PadelBook
          </h1>

          <p style={styles.text}>
            Crea el teu compte gratuïtament per reservar pistes de pàdel,
            consultar disponibilitat i gestionar les teves reserves.
          </p>
        </section>

        <section
          className="scale-in delay-1"
          style={{
            ...styles.formCard,
            ...(isMobileView ? styles.formCardMobile : {}),
          }}
        >
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Crear compte</h2>
            <p style={styles.formText}>
              Omple el formulari per començar a utilitzar PadelBook.
            </p>
          </div>

          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Nom i llinatges</label>

              <input
                type="text"
                placeholder="Ex: Pere Serra"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Correu electrònic</label>

              <input
                type="email"
                placeholder="exemple@correu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Contrasenya</label>

              <div
                style={{
                  ...styles.passwordWrapper,
                  ...(isMobileView ? styles.passwordWrapperMobile : {}),
                }}
              >
                <input
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
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              {capsLock && (
                <span style={styles.capsWarning}>
                  ⚠️ Tens el bloqueig de majúscules activat
                </span>
              )}

              <span style={styles.helpText}>
                Ha d'incloure majúscula, minúscula, número i símbol.
              </span>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirmar contrasenya</label>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repeteix la contrasenya"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Creant compte..." : "Crear compte"}
            </button>
          </form>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.footerBox}>
            <p style={styles.loginText}>Ja tens compte?</p>

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
  page: { padding: "2rem 1.5rem 3rem" },

  wrapper: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    alignItems: "stretch",
  },

  wrapperMobile: {
    gridTemplateColumns: "1fr",
    gap: "1rem",
  },

  infoPanel: {
    background: "linear-gradient(135deg,#1e40af,#2563eb)",
    color: "white",
    padding: "2rem",
    borderRadius: "20px",
    boxShadow: "0 10px 24px rgba(37,99,235,0.18)",
  },

  infoPanelMobile: {
    padding: "1.4rem",
    borderRadius: "16px",
  },

  badge: {
    background: "rgba(255,255,255,0.2)",
    padding: "0.4rem 0.7rem",
    borderRadius: "999px",
    fontWeight: "700",
    display: "inline-block",
    marginBottom: "1rem",
  },

  title: {
    marginTop: 0,
    fontSize: "2.3rem",
    lineHeight: 1.15,
  },

  titleMobile: {
    fontSize: "1.9rem",
  },

  text: {
    lineHeight: 1.7,
    marginBottom: 0,
  },

  formCard: {
    background: "white",
    padding: "2rem",
    borderRadius: "20px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },

  formCardMobile: {
    padding: "1.25rem",
    borderRadius: "16px",
  },

  formHeader: { marginBottom: "1.4rem" },

  formTitle: { margin: 0, fontSize: "2rem" },

  formText: { color: "#475569" },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },

  label: {
    fontWeight: "700",
  },

  input: {
    padding: "0.9rem 1rem",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    width: "100%",
    boxSizing: "border-box",
  },

  passwordWrapper: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "stretch",
  },

  passwordWrapperMobile: {
    flexDirection: "column",
  },

  showButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "0 0.8rem",
    background: "white",
    cursor: "pointer",
    fontWeight: "600",
    minWidth: "110px",
  },

  showButtonMobile: {
    width: "100%",
    minHeight: "44px",
  },

  capsWarning: {
    color: "#b91c1c",
    fontSize: "0.85rem",
    fontWeight: "600",
  },

  helpText: {
    fontSize: "0.8rem",
    color: "#64748b",
  },

  button: { marginTop: "0.5rem" },

  error: {
    background: "#fee2e2",
    padding: "0.8rem",
    borderRadius: "10px",
    color: "#b91c1c",
    fontWeight: "700",
    marginTop: "1rem",
  },

  footerBox: {
    marginTop: "1.2rem",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "1rem",
  },

  loginText: {
    marginBottom: "0.5rem",
  },
};

export default RegisterPage;