import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { getUserFromToken } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const fallbackUser = getUserFromToken();

  const [user, setUser] = useState(fallbackUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 920);

  const fetchCurrentUser = async ({ silent = false } = {}) => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setUser(null);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      const currentUser = response?.data?.data || null;

      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } else if (!silent) {
        setUser(getUserFromToken());
      }
    } catch (err) {
      console.error(err);
      setUser(getUserFromToken());
    }
  };

  useEffect(() => {
    fetchCurrentUser({ silent: true });
  }, [location.pathname]);

  useEffect(() => {
    const handleProfileUpdated = () => {
      fetchCurrentUser({ silent: true });
    };

    const handleStorageChange = () => {
      setUser(getUserFromToken());
    };

    window.addEventListener("profile-updated", handleProfileUpdated);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 920;
      setIsMobileView(mobile);

      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const getDisplayName = (fullName) => {
    if (!fullName) return "Usuari";
    return fullName.split(" ")[0];
  };

  const userName = getDisplayName(user?.nom);
  const userEmail = user?.email || "";
  const showMenuContent = !isMobileView || isMobileMenuOpen;

  const navLinks = useMemo(() => {
    const links = [
      { to: "/", label: "Inici" },
      { to: "/availability", label: "Disponibilitat" },
    ];

    if (user) {
      links.push(
        { to: "/my-reservations", label: "Les meves reserves" },
        { to: "/my-account", label: "El meu compte" }
      );

      if (user?.rol === "admin") {
        links.push({ to: "/admin", label: "Administració" });
      }
    }

    return links;
  }, [user]);

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <div style={styles.topRow}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoMark}>PB</span>

            <div style={styles.logoBlock}>
              <span style={styles.logoText}>PadelBook</span>
              <span style={styles.logoSubtext}>Reserves de pàdel</span>
            </div>
          </Link>

          {isMobileView && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              style={{
                ...styles.mobileMenuButton,
                ...(isMobileMenuOpen ? styles.mobileMenuButtonOpen : {}),
              }}
              aria-label={isMobileMenuOpen ? "Tancar menú" : "Obrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              <span style={styles.mobileMenuIcon}>
                {isMobileMenuOpen ? "✕" : "☰"}
              </span>
            </button>
          )}
        </div>

        {showMenuContent && (
          <div
            style={{
              ...styles.content,
              ...(isMobileView ? styles.contentMobile : {}),
            }}
          >
            <div
              style={{
                ...styles.links,
                ...(isMobileView ? styles.linksMobile : {}),
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    ...styles.link,
                    ...(isActive(link.to) ? styles.linkActive : {}),
                    ...(isMobileView ? styles.linkMobile : {}),
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div
              style={{
                ...styles.actions,
                ...(isMobileView ? styles.actionsMobile : {}),
              }}
            >
              {user ? (
                <>
                  <div
                    style={{
                      ...styles.userBox,
                      ...(isMobileView ? styles.userBoxMobile : {}),
                    }}
                  >
                    <span style={styles.userGreeting}>Hola, {userName}</span>
                    <span style={styles.userMeta}>
                      {user?.rol === "admin" ? "Administrador" : "Usuari"}
                    </span>
                    {userEmail && (
                      <span style={styles.userEmail}>{userEmail}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/my-account")}
                    className="btn btn-light"
                    style={isMobileView ? styles.fullWidthButton : undefined}
                  >
                    Perfil
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-light"
                    style={isMobileView ? styles.fullWidthButton : undefined}
                  >
                    Tancar sessió
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn-light"
                    style={isMobileView ? styles.fullWidthButton : undefined}
                  >
                    Iniciar sessió
                  </Link>

                  <Link
                    to="/register"
                    className="btn btn-primary"
                    style={isMobileView ? styles.fullWidthButton : undefined}
                  >
                    Crear compte
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid rgba(148,163,184,0.16)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0.95rem 1.25rem",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    textDecoration: "none",
  },
  logoMark: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    boxShadow: "0 14px 24px rgba(37,99,235,0.2)",
    flexShrink: 0,
  },
  logoBlock: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1,
  },
  logoText: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: "1.08rem",
    letterSpacing: "-0.01em",
  },
  logoSubtext: {
    color: "#64748b",
    fontSize: "0.78rem",
    marginTop: "0.18rem",
    fontWeight: "700",
  },
  content: {
    marginTop: "0.95rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  contentMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(148,163,184,0.14)",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    flexWrap: "wrap",
  },
  linksMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    width: "100%",
  },
  link: {
    textDecoration: "none",
    color: "#334155",
    fontWeight: "700",
    padding: "0.72rem 0.95rem",
    borderRadius: "14px",
    border: "1px solid transparent",
    transition: "all 0.2s ease",
  },
  linkMobile: {
    width: "100%",
    textAlign: "left",
  },
  linkActive: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    boxShadow: "0 6px 16px rgba(37,99,235,0.08)",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  actionsMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    width: "100%",
  },
  userBox: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "18px",
    padding: "0.75rem 0.9rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
    minWidth: "200px",
    boxShadow: "0 10px 22px rgba(15,23,42,0.04)",
  },
  userBoxMobile: {
    width: "100%",
    textAlign: "center",
    minWidth: "unset",
  },
  userGreeting: {
    color: "#0f172a",
    fontSize: "0.95rem",
    fontWeight: "800",
  },
  userMeta: {
    color: "#2563eb",
    fontSize: "0.8rem",
    fontWeight: "800",
  },
  userEmail: {
    color: "#64748b",
    fontSize: "0.8rem",
    fontWeight: "600",
    wordBreak: "break-word",
  },
  mobileMenuButton: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    border: "1px solid rgba(148,163,184,0.22)",
    background: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  mobileMenuButtonOpen: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  },
  mobileMenuIcon: {
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1,
  },
  fullWidthButton: {
    width: "100%",
  },
};

export default Navbar;