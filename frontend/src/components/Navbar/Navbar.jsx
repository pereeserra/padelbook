import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { getUserFromToken } from "../../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const fallbackUser = getUserFromToken();

  const [user, setUser] = useState(fallbackUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth <= 920);

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
    setIsUserMenuOpen(false);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const scrollToTopSmooth = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNavClick = (event, path) => {
    if (location.pathname === path) {
      event.preventDefault();
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
      scrollToTopSmooth();
    }
  };

  const handleNavigateWithTop = (path) => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);

    if (location.pathname === path) {
      scrollToTopSmooth();
      return;
    }

    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const getDisplayName = (fullName) => {
    if (!fullName) return "Usuari";
    return fullName.split(" ")[0];
  };

  const getInitials = (fullName) => {
    if (!fullName) return "U";

    const parts = fullName.trim().split(" ").filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 1).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const userName = getDisplayName(user?.nom);
  const userEmail = user?.email || "";
  const userRoleLabel = user?.rol === "admin" ? "Administrador" : "Usuari";

  const navLinks = useMemo(() => {
    const links = [
      { to: "/", label: "Inici" },
      { to: "/availability", label: "Disponibilitat" },
    ];

    if (user) {
      links.push({ to: "/my-reservations", label: "Les meves reserves" });

      if (user?.rol === "admin") {
        links.push({ to: "/admin", label: "Administració" });
      }
    }

    return links;
  }, [user]);

  return (
    <nav className="pb-navbar">
      <div className="pb-navbar__inner">
        <div className="pb-navbar__left">
          <Link
            to="/"
            className="pb-navbar__brand"
            aria-label="Anar a l'inici"
            onClick={(event) => handleNavClick(event, "/")}
          >
            <span className="pb-navbar__brand-mark">PB</span>

            <span className="pb-navbar__brand-copy">
              <span className="pb-navbar__brand-title">PadelBook</span>
              <span className="pb-navbar__brand-subtitle">Reserves de pàdel</span>
            </span>
          </Link>
        </div>

        {!isMobileView && (
          <div className="pb-navbar__center">
            <div className="pb-navbar__links">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`pb-navbar__link ${isActive(link.to) ? "is-active" : ""}`}
                  onClick={(event) => handleNavClick(event, link.to)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="pb-navbar__right">
          {user ? (
            <div className="pb-navbar__user" ref={userMenuRef}>
              <button
                type="button"
                className={`pb-navbar__user-trigger ${isUserMenuOpen ? "is-open" : ""}`}
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-label="Obrir menú d'usuari"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
              >
                <span className="pb-navbar__avatar">{getInitials(user?.nom)}</span>

                {!isMobileView && (
                  <span className="pb-navbar__user-meta">
                    <span className="pb-navbar__user-name">{userName}</span>
                    <span className="pb-navbar__user-role">{userRoleLabel}</span>
                  </span>
                )}

                {!isMobileView && (
                  <span className="pb-navbar__chevron" aria-hidden="true">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="pb-navbar__dropdown" role="menu">
                  <div className="pb-navbar__dropdown-head">
                    <span className="pb-navbar__dropdown-name">{user?.nom || "Usuari"}</span>
                    <span className="pb-navbar__dropdown-role">{userRoleLabel}</span>
                    {userEmail && (
                      <span className="pb-navbar__dropdown-email">{userEmail}</span>
                    )}
                  </div>

                  <div className="pb-navbar__dropdown-body">
                    <button
                      type="button"
                      className="pb-navbar__dropdown-item"
                      onClick={() => handleNavigateWithTop("/my-account")}
                    >
                      <span className="pb-navbar__dropdown-icon" aria-hidden="true">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M3 17C3.87518 14.3766 6.49511 12.5 10 12.5C13.5049 12.5 16.1248 14.3766 17 17"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span>El meu compte</span>
                    </button>

                    {user?.rol === "admin" && (
                      <button
                        type="button"
                        className="pb-navbar__dropdown-item"
                        onClick={() => handleNavigateWithTop("/admin")}
                      >
                        <span className="pb-navbar__dropdown-icon" aria-hidden="true">
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 2L12.25 4.25L15.5 4.5L15.75 7.75L18 10L15.75 12.25L15.5 15.5L12.25 15.75L10 18L7.75 15.75L4.5 15.5L4.25 12.25L2 10L4.25 7.75L4.5 4.5L7.75 4.25L10 2Z"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                              stroke="currentColor"
                              strokeWidth="1.4"
                            />
                          </svg>
                        </span>
                        <span>Administració</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="pb-navbar__dropdown-item is-danger"
                      onClick={handleLogout}
                    >
                      <span className="pb-navbar__dropdown-icon" aria-hidden="true">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 4H5.75C5.05964 4 4.5 4.55964 4.5 5.25V14.75C4.5 15.4404 5.05964 16 5.75 16H8"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                          <path
                            d="M11.5 13.5L15 10L11.5 6.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 10H8"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span>Tancar sessió</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            !isMobileView && (
              <div className="pb-navbar__guest-actions">
                <Link
                  to="/login"
                  className="btn btn-light btn-sm"
                  onClick={(event) => handleNavClick(event, "/login")}
                >
                  Iniciar sessió
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                  onClick={(event) => handleNavClick(event, "/register")}
                >
                  Crear compte
                </Link>
              </div>
            )
          )}

          {isMobileView && (
            <button
              type="button"
              className={`pb-navbar__mobile-toggle ${isMobileMenuOpen ? "is-open" : ""}`}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Tancar menú" : "Obrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="pb-navbar__mobile-toggle-line" />
              <span className="pb-navbar__mobile-toggle-line" />
              <span className="pb-navbar__mobile-toggle-line" />
            </button>
          )}
        </div>
      </div>

      {isMobileView && isMobileMenuOpen && (
        <div className="pb-navbar__mobile-panel">
          <div className="pb-navbar__mobile-links">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`pb-navbar__mobile-link ${isActive(link.to) ? "is-active" : ""}`}
                onClick={(event) => handleNavClick(event, link.to)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {!user && (
            <div className="pb-navbar__mobile-actions">
              <Link
                to="/login"
                className="btn btn-light btn-full"
                onClick={(event) => handleNavClick(event, "/login")}
              >
                Iniciar sessió
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-full"
                onClick={(event) => handleNavClick(event, "/register")}
              >
                Crear compte
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;