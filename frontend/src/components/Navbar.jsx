import { useEffect, useState } from "react";
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

  const fetchCurrentUser = async () => {
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
      } else {
        setUser(getUserFromToken());
      }
    } catch (err) {
      console.error(err);
      setUser(getUserFromToken());
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [location.pathname]);

  useEffect(() => {
    const handleProfileUpdated = () => {
      fetchCurrentUser();
    };

    window.addEventListener("profile-updated", handleProfileUpdated);

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
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
  const showMenuContent = !isMobileView || isMobileMenuOpen;

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <div style={styles.topRow}>
          <div style={styles.left}>
            <Link to="/" style={styles.logo}>
              <span style={styles.logoMark}>PB</span>
              <span style={styles.logoText}>PadelBook</span>
            </Link>
          </div>

          {isMobileView && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              style={styles.mobileMenuButton}
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
              ...styles.right,
              ...(isMobileView ? styles.rightMobile : {}),
            }}
          >
            <div
              style={{
                ...styles.links,
                ...(isMobileView ? styles.linksMobile : {}),
              }}
            >
              <Link
                to="/"
                style={{
                  ...styles.link,
                  ...(isActive("/") ? styles.linkActive : {}),
                }}
              >
                Inici
              </Link>

              <Link
                to="/availability"
                style={{
                  ...styles.link,
                  ...(isActive("/availability") ? styles.linkActive : {}),
                }}
              >
                Disponibilitat
              </Link>

              {user && (
                <>
                  <Link
                    to="/my-reservations"
                    style={{
                      ...styles.link,
                      ...(isActive("/my-reservations") ? styles.linkActive : {}),
                    }}
                  >
                    Les meves reserves
                  </Link>

                  <Link
                    to="/my-account"
                    style={{
                      ...styles.link,
                      ...(isActive("/my-account") ? styles.linkActive : {}),
                    }}
                  >
                    El meu compte
                  </Link>

                  {user?.rol === "admin" && (
                    <Link
                      to="/admin"
                      style={{
                        ...styles.link,
                        ...(isActive("/admin") ? styles.linkActive : {}),
                      }}
                    >
                      Administració
                    </Link>
                  )}
                </>
              )}
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
                      ...styles.userBadge,
                      ...(isMobileView ? styles.userBadgeMobile : {}),
                    }}
                  >
                    Hola, {userName}
                  </div>

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
    backgroundColor: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid #e5e7eb",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0.9rem 1.25rem",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    textDecoration: "none",
  },
  logoMark: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
    color: "white",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    boxShadow: "0 8px 20px rgba(37,99,235,0.22)",
  },
  logoText: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: "1.1rem",
    letterSpacing: "0.01em",
  },
  right: {
    marginTop: "0.9rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  rightMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
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
    padding: "0.7rem 0.9rem",
    borderRadius: "12px",
    transition: "all 0.2s ease",
  },
  linkActive: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  actionsMobile: {
    width: "100%",
    flexDirection: "column",
    alignItems: "stretch",
  },
  userBadge: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    padding: "0.65rem 0.9rem",
    borderRadius: "999px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  userBadgeMobile: {
    width: "100%",
    textAlign: "center",
    borderRadius: "14px",
  },
  mobileMenuButton: {
    border: "1px solid #cbd5e1",
    backgroundColor: "white",
    borderRadius: "12px",
    width: "44px",
    height: "44px",
    cursor: "pointer",
  },
  mobileMenuIcon: {
    fontSize: "1.25rem",
    lineHeight: 1,
    color: "#0f172a",
    fontWeight: "700",
  },
  fullWidthButton: {
    width: "100%",
  },
};

export default Navbar;