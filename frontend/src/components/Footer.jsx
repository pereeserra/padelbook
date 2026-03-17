import { Link, useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();

  const scrollToTopSmooth = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleFooterLinkClick = (event, path) => {
    if (location.pathname === path) {
      event.preventDefault();
      scrollToTopSmooth();
    }
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.left}>
          <Link
            to="/"
            style={styles.brandLink}
            onClick={(event) => handleFooterLinkClick(event, "/")}
          >
            <span style={styles.brand}>PadelBook</span>
          </Link>

          <p style={styles.text}>
            Gestió moderna de reserves de pistes de pàdel.
          </p>
        </div>

        <div style={styles.center}>
          <Link
            to="/"
            style={styles.link}
            onClick={(event) => handleFooterLinkClick(event, "/")}
          >
            Inici
          </Link>

          <Link
            to="/availability"
            style={styles.link}
            onClick={(event) => handleFooterLinkClick(event, "/availability")}
          >
            Reservar
          </Link>

          <Link
            to="/my-account"
            style={styles.link}
            onClick={(event) => handleFooterLinkClick(event, "/my-account")}
          >
            El meu compte
          </Link>
        </div>

        <div style={styles.right}>
          <span style={styles.copy}>
            © {new Date().getFullYear()} PadelBook
          </span>
          <span style={styles.meta}>Projecte DAW</span>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: "3rem",
    padding: "2rem 0",
    borderTop: "1px solid rgba(148,163,184,0.2)",
    background: "#f8fafc",
  },
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1rem",
    alignItems: "center",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  brandLink: {
    textDecoration: "none",
    width: "fit-content",
  },
  brand: {
    fontWeight: "800",
    fontSize: "1rem",
    color: "#0f172a",
  },
  text: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#64748b",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  link: {
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#334155",
  },
  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.3rem",
  },
  copy: {
    fontSize: "0.85rem",
    color: "#64748b",
    fontWeight: "600",
  },
  meta: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
};

export default Footer;