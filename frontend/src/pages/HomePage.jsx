import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function HomePage() {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.container,
          ...(isMobileView ? styles.containerMobile : {}),
        }}
      >
        <section
          className="fade-in-up"
          style={{
            ...styles.hero,
            ...(isMobileView ? styles.heroMobile : {}),
          }}
        >
          <div style={styles.heroContent}>
            <span style={styles.badge}>Plataforma de reserves de pàdel</span>

            <h1
              style={{
                ...styles.title,
                ...(isMobileView ? styles.titleMobile : {}),
              }}
            >
              Reserva pistes de pàdel d’una manera ràpida, clara i professional
            </h1>

            <p style={styles.subtitle}>
              PadelBook és una aplicació web pensada per consultar disponibilitat,
              gestionar reserves i oferir una experiència senzilla tant per a
              usuaris com per a administradors.
            </p>

            <div
              style={{
                ...styles.actions,
                ...(isMobileView ? styles.actionsMobile : {}),
              }}
            >
              <Link
                to="/availability"
                className="btn btn-light"
                style={isMobileView ? styles.fullWidthButton : styles.primaryButton}
              >
                Consultar disponibilitat
              </Link>

              <Link
                to="/register"
                className="btn btn-primary"
                style={isMobileView ? styles.fullWidthButton : styles.secondaryButton}
              >
                Crear compte
              </Link>
            </div>

            <div
              style={{
                ...styles.heroStats,
                ...(isMobileView ? styles.heroStatsMobile : {}),
              }}
            >
              <div style={styles.statCard}>
                <span style={styles.statNumber}>24/7</span>
                <span style={styles.statLabel}>Consulta online</span>
              </div>

              <div style={styles.statCard}>
                <span style={styles.statNumber}>Ràpid</span>
                <span style={styles.statLabel}>Procés de reserva àgil</span>
              </div>

              <div style={styles.statCard}>
                <span style={styles.statNumber}>Clar</span>
                <span style={styles.statLabel}>Interfície intuïtiva</span>
              </div>
            </div>
          </div>
        </section>

        <section className="fade-in-up delay-1" style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2
              style={{
                ...styles.sectionTitle,
                ...(isMobileView ? styles.sectionTitleMobile : {}),
              }}
            >
              Què pots fer amb PadelBook?
            </h2>
            <p style={styles.sectionText}>
              Una plataforma pensada per centralitzar les funcionalitats principals
              d’un sistema modern de reserves de pistes.
            </p>
          </div>

          <div
            style={{
              ...styles.featureGrid,
              ...(isMobileView ? styles.singleColumnGrid : {}),
            }}
          >
            <article style={styles.featureCard}>
              <div style={styles.featureIcon}>📅</div>
              <h3 style={styles.featureTitle}>Consultar disponibilitat</h3>
              <p style={styles.featureText}>
                Revisa ràpidament quines pistes i franges horàries estan lliures
                per al dia seleccionat.
              </p>
            </article>

            <article style={styles.featureCard}>
              <div style={styles.featureIcon}>✅</div>
              <h3 style={styles.featureTitle}>Reservar pistes</h3>
              <p style={styles.featureText}>
                Fes una reserva de manera senzilla amb feedback visual clar i un
                flux molt més còmode per a l’usuari.
              </p>
            </article>

            <article style={styles.featureCard}>
              <div style={styles.featureIcon}>🧾</div>
              <h3 style={styles.featureTitle}>Gestionar reserves</h3>
              <p style={styles.featureText}>
                Consulta l’historial de reserves, revisa la informació important i
                cancel·la-les quan sigui necessari.
              </p>
            </article>

            <article style={styles.featureCard}>
              <div style={styles.featureIcon}>⚙️</div>
              <h3 style={styles.featureTitle}>Administració</h3>
              <p style={styles.featureText}>
                L’usuari administrador pot controlar pistes, reserves i
                funcionalitats internes del sistema.
              </p>
            </article>
          </div>
        </section>

        <section className="fade-in-up delay-2" style={styles.workflowSection}>
          <div style={styles.sectionHeader}>
            <h2
              style={{
                ...styles.sectionTitle,
                ...(isMobileView ? styles.sectionTitleMobile : {}),
              }}
            >
              Com funciona?
            </h2>
            <p style={styles.sectionText}>
              Un procés simple perquè l’usuari pugui reservar sense complicacions.
            </p>
          </div>

          <div
            style={{
              ...styles.workflowGrid,
              ...(isMobileView ? styles.singleColumnGrid : {}),
            }}
          >
            <div style={styles.stepCard}>
              <span style={styles.stepNumber}>1</span>
              <h3 style={styles.stepTitle}>Selecciona una data</h3>
              <p style={styles.stepText}>
                Tria el dia que vols consultar i revisa les pistes disponibles en
                temps real.
              </p>
            </div>

            <div style={styles.stepCard}>
              <span style={styles.stepNumber}>2</span>
              <h3 style={styles.stepTitle}>Escull una franja</h3>
              <p style={styles.stepText}>
                Compara ràpidament la disponibilitat i selecciona la franja que
                més t’interessa.
              </p>
            </div>

            <div style={styles.stepCard}>
              <span style={styles.stepNumber}>3</span>
              <h3 style={styles.stepTitle}>Confirma la reserva</h3>
              <p style={styles.stepText}>
                El sistema registra la reserva i et mostra feedback visual perquè
                sàpigues que tot ha anat bé.
              </p>
            </div>
          </div>
        </section>

        <section className="fade-in-up delay-3" style={styles.finalCta}>
          <div
            style={{
              ...styles.finalCtaContent,
              ...(isMobileView ? styles.finalCtaContentMobile : {}),
            }}
          >
            <div>
              <span style={styles.finalBadge}>Preparat per començar?</span>
              <h2
                style={{
                  ...styles.finalTitle,
                  ...(isMobileView ? styles.finalTitleMobile : {}),
                }}
              >
                Accedeix ara i comença a gestionar les teves reserves
              </h2>
              <p style={styles.finalText}>
                Tant si vols consultar pistes com si vols reservar-ne una, ja tens
                totes les eines a la teva disposició.
              </p>
            </div>

            <div
              style={{
                ...styles.finalActions,
                ...(isMobileView ? styles.actionsMobile : {}),
              }}
            >
              <Link
                to="/availability"
                className="btn btn-primary"
                style={isMobileView ? styles.fullWidthButton : styles.finalPrimary}
              >
                Veure disponibilitat
              </Link>

              <Link
                to="/login"
                className="btn btn-light"
                style={isMobileView ? styles.fullWidthButton : styles.finalSecondary}
              >
                Iniciar sessió
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "2rem 0 3rem",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },

  containerMobile: {
    padding: "0 1rem",
  },

  hero: {
    background: "linear-gradient(135deg, #1e40af, #2563eb)",
    color: "white",
    borderRadius: "24px",
    padding: "3rem 2.25rem",
    boxShadow: "0 16px 32px rgba(37,99,235,0.22)",
    marginBottom: "2rem",
  },

  heroMobile: {
    padding: "1.6rem 1.25rem",
    borderRadius: "18px",
  },

  heroContent: {
    maxWidth: "900px",
  },

  badge: {
    display: "inline-block",
    backgroundColor: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    fontWeight: "700",
    marginBottom: "1rem",
  },

  title: {
    fontSize: "3.1rem",
    marginTop: 0,
    marginBottom: "1rem",
    lineHeight: 1.08,
    maxWidth: "850px",
  },

  titleMobile: {
    fontSize: "2.05rem",
    lineHeight: 1.12,
  },

  subtitle: {
    fontSize: "1.12rem",
    lineHeight: 1.75,
    marginBottom: "1.8rem",
    opacity: 0.97,
    maxWidth: "760px",
  },

  actions: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "2rem",
  },

  actionsMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  fullWidthButton: {
    width: "100%",
  },

  primaryButton: {},
  secondaryButton: {},

  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },

  heroStatsMobile: {
    gridTemplateColumns: "1fr",
  },

  statCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "18px",
    padding: "1rem 1.1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    backdropFilter: "blur(4px)",
  },

  statNumber: {
    fontSize: "1.25rem",
    fontWeight: "800",
  },

  statLabel: {
    opacity: 0.92,
    lineHeight: 1.5,
  },

  section: {
    marginTop: "2.4rem",
  },

  sectionHeader: {
    marginBottom: "1.25rem",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "0.45rem",
    fontSize: "2rem",
    color: "#0f172a",
  },

  sectionTitleMobile: {
    fontSize: "1.65rem",
  },

  sectionText: {
    margin: 0,
    color: "#475569",
    fontSize: "1rem",
    lineHeight: 1.65,
    maxWidth: "720px",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.2rem",
  },

  singleColumnGrid: {
    gridTemplateColumns: "1fr",
  },

  featureCard: {
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "1.4rem",
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
  },

  featureIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    backgroundColor: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
    marginBottom: "1rem",
  },

  featureTitle: {
    marginTop: 0,
    marginBottom: "0.55rem",
    fontSize: "1.2rem",
    color: "#0f172a",
  },

  featureText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
  },

  workflowSection: {
    marginTop: "2.6rem",
  },

  workflowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.2rem",
  },

  stepCard: {
    backgroundColor: "#f8fbff",
    border: "1px solid #dbeafe",
    borderRadius: "18px",
    padding: "1.4rem",
  },

  stepNumber: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "800",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.9rem",
  },

  stepTitle: {
    marginTop: 0,
    marginBottom: "0.5rem",
    fontSize: "1.15rem",
    color: "#0f172a",
  },

  stepText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
  },

  finalCta: {
    marginTop: "2.8rem",
  },

  finalCtaContent: {
    backgroundColor: "white",
    borderRadius: "22px",
    padding: "1.8rem",
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
  },

  finalCtaContentMobile: {
    padding: "1.25rem",
    borderRadius: "16px",
  },

  finalBadge: {
    display: "inline-block",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    padding: "0.4rem 0.75rem",
    borderRadius: "999px",
    fontWeight: "700",
    marginBottom: "0.9rem",
  },

  finalTitle: {
    marginTop: 0,
    marginBottom: "0.55rem",
    fontSize: "2rem",
    color: "#0f172a",
    maxWidth: "700px",
  },

  finalTitleMobile: {
    fontSize: "1.65rem",
  },

  finalText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
    maxWidth: "720px",
  },

  finalActions: {
    display: "flex",
    gap: "0.8rem",
    flexWrap: "wrap",
  },

  finalPrimary: {},
  finalSecondary: {},
};

export default HomePage;