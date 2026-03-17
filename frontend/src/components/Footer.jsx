import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.left}>
          <span style={styles.brand}>PadelBook</span>
          <p style={styles.text}>
            Gestió moderna de reserves de pistes de pàdel.
          </p>
        </div>

        <div style={styles.center}>
          <Link to="/" style={styles.link}>Inici</Link>
          <Link to="/availability" style={styles.link}>Reservar</Link>
          <Link to="/my-account" style={styles.link}>El meu compte</Link>
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