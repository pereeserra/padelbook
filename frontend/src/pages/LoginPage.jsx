import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function LoginPage() {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCapsLock = (e) => {
    setCapsLock(e.getModifierState("CapsLock"));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const token = response?.data?.data?.token || "";
      const user = response?.data?.data?.user || null;

      if (!token) {
        throw new Error("No s'ha rebut el token de sessió");
      }

      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      window.dispatchEvent(new Event("profile-updated"));
      navigate("/availability");
    } catch (err) {
      console.error(err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error iniciant sessió");
      }
    } finally {
      setLoading(false);
    }
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
          <span style={styles.badge}>Accés d’usuaris</span>

          <h1
            style={{
              ...styles.title,
              ...(isMobileView ? styles.titleMobile : {}),
            }}
          >
            Inicia sessió a PadelBook
          </h1>

          <p style={styles.text}>
            Accedeix per reservar pistes, consultar les teves reserves i, si ets
            administrador, gestionar el sistema.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureDot} />
              <span>Consulta la disponibilitat de pistes en segons</span>
            </div>

            <div style={styles.featureItem}>
              <span style={styles.featureDot} />
              <span>Gestiona les teves reserves des d’un únic espai</span>
            </div>

            <div style={styles.featureItem}>
              <span style={styles.featureDot} />
              <span>Accedeix a una experiència clara, ràpida i moderna</span>
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
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Benvingut de nou</h2>
            <p style={styles.formText}>
              Introdueix les teves credencials per continuar.
            </p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
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
                autoComplete="email"
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
                  placeholder="Introdueix la teva contrasenya"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleCapsLock}
                  onKeyUp={handleCapsLock}
                  style={styles.input}
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Iniciant sessió..." : "Iniciar sessió"}
            </button>
          </form>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.footerBox}>
            <p style={styles.registerText}>Encara no tens compte?</p>

            <Link
              to="/register"
              className="btn btn-light btn-full"
              style={styles.registerButton}
            >
              Crear compte
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    background:
      "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(239,246,255,1) 100%)",
  },
  wrapper: {
    width: "100%",
    maxWidth: "1120px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "1.5rem",
    alignItems: "stretch",
  },
  wrapperMobile: {
    gridTemplateColumns: "1fr",
  },
  infoPanel: {
    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
    color: "white",
    borderRadius: "24px",
    padding: "2.25rem",
    boxShadow: "0 20px 40px rgba(37,99,235,0.18)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  infoPanelMobile: {
    padding: "1.5rem",
    borderRadius: "18px",
  },
  badge: {
    display: "inline-block",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.16)",
    color: "white",
    borderRadius: "999px",
    padding: "0.4rem 0.85rem",
    fontWeight: "700",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  title: {
    margin: 0,
    fontSize: "2.5rem",
    lineHeight: 1.15,
  },
  titleMobile: {
    fontSize: "2rem",
  },
  text: {
    marginTop: "1rem",
    marginBottom: "1.5rem",
    fontSize: "1.05rem",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.92)",
    maxWidth: "560px",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontWeight: "600",
    lineHeight: 1.5,
  },
  featureDot: {
    width: "10px",
    height: "10px",
    minWidth: "10px",
    borderRadius: "999px",
    backgroundColor: "#bfdbfe",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "2rem",
    boxShadow: "0 16px 32px rgba(15,23,42,0.08)",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  formCardMobile: {
    padding: "1.35rem",
    borderRadius: "18px",
  },
  formHeader: {
    marginBottom: "1.25rem",
  },
  formTitle: {
    margin: 0,
    fontSize: "1.75rem",
    color: "#0f172a",
  },
  formText: {
    marginTop: "0.5rem",
    marginBottom: 0,
    color: "#475569",
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
    color: "#1e293b",
    fontSize: "0.95rem",
  },
  input: {
    width: "100%",
    padding: "0.95rem 1rem",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    backgroundColor: "white",
    color: "#0f172a",
    fontSize: "1rem",
    outline: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
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
    padding: "0 0.9rem",
    backgroundColor: "white",
    cursor: "pointer",
    fontWeight: "700",
    color: "#334155",
    minWidth: "96px",
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
  button: {
    marginTop: "0.35rem",
  },
  error: {
    color: "#b91c1c",
    fontWeight: "700",
    marginTop: "1rem",
    backgroundColor: "#fee2e2",
    padding: "0.9rem 1rem",
    borderRadius: "12px",
  },
  footerBox: {
    marginTop: "1.4rem",
    paddingTop: "1.2rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  registerText: {
    margin: 0,
    color: "#475569",
    fontWeight: "600",
  },
  registerButton: {},
};

export default LoginPage;