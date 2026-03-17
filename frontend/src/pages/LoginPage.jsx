import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function LoginPage() {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 900);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const navigate = useNavigate();
  const feedbackRef = useRef(null);

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
        setError("Error iniciant sessió.");
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
            ...styles.visualPanel,
            ...(isMobileView ? styles.visualPanelMobile : {}),
          }}
        >
          <div style={styles.visualGlowOne} />
          <div style={styles.visualGlowTwo} />

          <div style={styles.visualContent}>
            <span style={styles.badge}>Accés segur</span>

            <h1
              style={{
                ...styles.title,
                ...(isMobileView ? styles.titleMobile : {}),
              }}
            >
              Torna a entrar i continua gestionant les teves reserves
            </h1>

            <p style={styles.text}>
              Accedeix a PadelBook per consultar disponibilitat, reservar pistes i
              revisar el teu historial amb una experiència més clara i agradable.
            </p>

            <div style={styles.featureStack}>
              <div style={styles.featureCard}>
                <span style={styles.featureIcon}>🎾</span>
                <div>
                  <strong style={styles.featureTitle}>Disponibilitat al moment</strong>
                  <p style={styles.featureText}>
                    Consulta pistes i franges disponibles de manera ràpida.
                  </p>
                </div>
              </div>

              <div style={styles.featureCard}>
                <span style={styles.featureIcon}>📅</span>
                <div>
                  <strong style={styles.featureTitle}>Reserves sota control</strong>
                  <p style={styles.featureText}>
                    Revisa, confirma o cancel·la les teves reserves des del mateix espai.
                  </p>
                </div>
              </div>

              <div style={styles.featureCard}>
                <span style={styles.featureIcon}>✨</span>
                <div>
                  <strong style={styles.featureTitle}>Experiència més cuidada</strong>
                  <p style={styles.featureText}>
                    Navegació més neta, feedback visible i millor sensació general.
                  </p>
                </div>
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
            <span style={styles.formKicker}>Iniciar sessió</span>
            <h2 style={styles.formTitle}>Benvingut de nou</h2>
            <p style={styles.formText}>
              Introdueix les teves credencials per accedir al teu compte.
            </p>
          </div>

          <div ref={feedbackRef} />

          {error && (
            <div className="scale-in" style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

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
              disabled={loading}
            >
              {loading ? "Iniciant sessió..." : "Entrar a PadelBook"}
            </button>
          </form>

          <div style={styles.separator}>
            <span style={styles.separatorLine} />
            <span style={styles.separatorText}>o</span>
            <span style={styles.separatorLine} />
          </div>

          <div style={styles.footerBox}>
            <p style={styles.footerText}>Encara no tens compte?</p>

            <Link to="/register" className="btn btn-light btn-full">
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
    padding: "2rem 1rem 3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  wrapper: {
    width: "100%",
    maxWidth: "1180px",
    display: "grid",
    gridTemplateColumns: "1.08fr 0.92fr",
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
      "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(37,99,235,0.9))",
    boxShadow: "0 26px 56px rgba(37,99,235,0.16)",
    minHeight: "640px",
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
    top: "-60px",
    right: "-40px",
    filter: "blur(4px)",
  },

  visualGlowTwo: {
    position: "absolute",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background: "rgba(16,185,129,0.12)",
    bottom: "-60px",
    left: "-40px",
    filter: "blur(8px)",
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
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "white",
    fontWeight: "800",
    marginBottom: "1rem",
  },

  title: {
    color: "white",
    marginBottom: "1rem",
    maxWidth: "620px",
    fontSize: "3.3rem",
    lineHeight: 1.02,
  },

  titleMobile: {
    fontSize: "2.3rem",
  },

  text: {
    color: "rgba(255,255,255,0.84)",
    marginBottom: "1.5rem",
    maxWidth: "620px",
    fontSize: "1.04rem",
  },

  featureStack: {
    display: "grid",
    gap: "0.95rem",
  },

  featureCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.85rem",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "1rem",
    backdropFilter: "blur(10px)",
  },

  featureIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.14)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    flexShrink: 0,
  },

  featureTitle: {
    display: "block",
    color: "white",
    marginBottom: "0.25rem",
    fontSize: "1rem",
  },

  featureText: {
    margin: 0,
    color: "rgba(255,255,255,0.78)",
    fontSize: "0.95rem",
    lineHeight: 1.6,
  },

  formCard: {
    background: "rgba(255,255,255,0.86)",
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
    marginBottom: "1.25rem",
  },

  formKicker: {
    display: "inline-block",
    marginBottom: "0.7rem",
    padding: "0.42rem 0.75rem",
    borderRadius: "999px",
    background: "rgba(37,99,235,0.08)",
    color: "#1d4ed8",
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
    background: "rgba(255,255,255,0.92)",
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

export default LoginPage;