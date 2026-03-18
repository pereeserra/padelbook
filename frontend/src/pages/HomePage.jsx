import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function HomePage() {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 900);
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
          <div
            style={{
              ...styles.heroGrid,
              ...(isMobileView ? styles.heroGridMobile : {}),
            }}
          >
            <div style={styles.heroContent}>
              <div style={styles.heroTopLine}>
                <span className="pb-chip">Plataforma moderna de reserves</span>
                <span className="pb-chip">UX clara i ràpida</span>
              </div>

              <h1
                style={{
                  ...styles.title,
                  ...(isMobileView ? styles.titleMobile : {}),
                }}
              >
                Reserva pistes de pàdel amb una experiència més elegant, clara i
                agradable
              </h1>

              <p style={styles.subtitle}>
                PadelBook és una aplicació web pensada perquè consultar
                disponibilitat, reservar i gestionar pistes sigui fàcil, visual i
                intuitiu. Menys fricció, més sensació de producte real.
              </p>

              <div
                style={{
                  ...styles.actions,
                  ...(isMobileView ? styles.actionsMobile : {}),
                }}
              >
                <Link
                  to="/availability"
                  className="btn btn-primary"
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Explorar disponibilitat
                </Link>

                <Link
                  to="/register"
                  className="btn btn-light"
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Crear compte
                </Link>
              </div>

              <div
                style={{
                  ...styles.metrics,
                  ...(isMobileView ? styles.metricsMobile : {}),
                }}
              >
                <div style={styles.metricCard}>
                  <span style={styles.metricValue}>24/7</span>
                  <span style={styles.metricLabel}>Consulta online</span>
                </div>

                <div style={styles.metricCard}>
                  <span style={styles.metricValue}>UX</span>
                  <span style={styles.metricLabel}>Reserva més clara</span>
                </div>

                <div style={styles.metricCard}>
                  <span style={styles.metricValue}>Ràpid</span>
                  <span style={styles.metricLabel}>Flux sense embolics</span>
                </div>
              </div>
            </div>

            <div style={styles.heroVisual}>
              <div style={styles.mockupCard}>
                <div style={styles.mockupTop}>
                  <span style={styles.mockupCourtBadge}>Pista 2 · Disponible</span>
                  <span style={styles.mockupToday}>Avui</span>
                </div>

                <div style={styles.mockupCourt}>
                  <div style={styles.courtLineVertical} />
                  <div style={styles.courtLineHorizontal} />
                  <div style={styles.courtCircle} />
                </div>

                <div style={styles.mockupSlots}>
                  <div style={styles.mockupSlotRow}>
                    <span style={styles.mockupHour}>17:00</span>
                    <span style={styles.slotFree}>Lliure</span>
                  </div>

                  <div style={styles.mockupSlotRow}>
                    <span style={styles.mockupHour}>18:30</span>
                    <span style={styles.slotReserved}>Reservada</span>
                  </div>

                  <div style={styles.mockupSlotRow}>
                    <span style={styles.mockupHour}>20:00</span>
                    <span style={styles.slotFree}>Lliure</span>
                  </div>
                </div>

                <div style={styles.mockupBottomCards}>
                  <div style={styles.mockupMiniCard}>
                    <span style={styles.mockupMiniEyebrow}>Experiència</span>
                    <h4 style={styles.mockupMiniTitle}>Visual i intuïtiva</h4>
                    <p style={styles.mockupMiniText}>
                      Tot més ordenat, més net i amb millor sensació d’ús.
                    </p>
                  </div>

                  <div style={styles.mockupMiniCard}>
                    <span style={styles.mockupMiniEyebrow}>Gestió</span>
                    <h4 style={styles.mockupMiniTitle}>Control de reserves</h4>
                    <p style={styles.mockupMiniText}>
                      Disponibilitat, historial i perfil dins un entorn coherent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fade-in-up delay-1" style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionKicker}>Per què destaca?</span>
            <h2 style={styles.sectionTitle}>Una home que convida a explorar</h2>
            <p style={styles.sectionText}>
              En lloc de semblar una pràctica bàsica, aquesta nova línia visual
              cerca que la web tengui presència, profunditat i una primera
              impressió molt més bona.
            </p>
          </div>

          <div
            style={{
              ...styles.featureGrid,
              ...(isMobileView ? styles.singleColumnGrid : {}),
            }}
          >
            <article style={styles.featureCard}>
              <div style={styles.featureIconWrap}>
                <span style={styles.featureIcon}>🎯</span>
              </div>
              <h3 style={styles.featureTitle}>Claredat immediata</h3>
              <p style={styles.featureText}>
                L’usuari entén ràpidament què pot fer: mirar disponibilitat,
                reservar i gestionar el seu compte.
              </p>
            </article>

            <article style={styles.featureCard}>
              <div style={styles.featureIconWrap}>
                <span style={styles.featureIcon}>✨</span>
              </div>
              <h3 style={styles.featureTitle}>Aspecte més premium</h3>
              <p style={styles.featureText}>
                Fons suaus, targetes amb profunditat, botons arrodonits i una
                tipografia més moderna.
              </p>
            </article>

            <article style={styles.featureCard}>
              <div style={styles.featureIconWrap}>
                <span style={styles.featureIcon}>📱</span>
              </div>
              <h3 style={styles.featureTitle}>Més agradable en mòbil</h3>
              <p style={styles.featureText}>
                La disposició s’adapta millor i els blocs tenen més aire i més
                ordre visual.
              </p>
            </article>
          </div>
        </section>

        <section className="fade-in-up delay-2" style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionKicker}>Ambient visual</span>
            <h2 style={styles.sectionTitle}>Tres àrees que fan més viva la web</h2>
            <p style={styles.sectionText}>
              Encara no hem posat fotografies reals, però ja hem creat blocs
              visuals forts perquè la pàgina deixi de veure’s plana.
            </p>
          </div>

          <div
            style={{
              ...styles.galleryGrid,
              ...(isMobileView ? styles.singleColumnGrid : {}),
            }}
          >
            <article style={{ ...styles.galleryCard, ...styles.galleryCardBlue }}>
              <div style={styles.galleryOverlay} />
              <div style={styles.galleryContent}>
                <span style={styles.galleryBadge}>Consulta</span>
                <h3 style={styles.galleryTitle}>Disponibilitat clara</h3>
                <p style={styles.galleryText}>
                  Mira pistes i franges horàries amb una lectura molt més còmoda.
                </p>
              </div>
            </article>

            <article style={{ ...styles.galleryCard, ...styles.galleryCardGreen }}>
              <div style={styles.galleryOverlay} />
              <div style={styles.galleryContent}>
                <span style={styles.galleryBadge}>Reserva</span>
                <h3 style={styles.galleryTitle}>Accions més directes</h3>
                <p style={styles.galleryText}>
                  El flux se centra en fer les coses ràpid i sense confusió.
                </p>
              </div>
            </article>

            <article style={{ ...styles.galleryCard, ...styles.galleryCardDark }}>
              <div style={styles.galleryOverlay} />
              <div style={styles.galleryContent}>
                <span style={styles.galleryBadge}>Compte</span>
                <h3 style={styles.galleryTitle}>Gestió personal</h3>
                <p style={styles.galleryText}>
                  Perfil, historial i informació de l’usuari dins una experiència
                  coherent.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="fade-in-up delay-3" style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionKicker}>Com funciona</span>
            <h2 style={styles.sectionTitle}>Un procés simple i agradable</h2>
            <p style={styles.sectionText}>
              L’objectiu és que l’usuari no pensi massa: entra, mira, tria i
              reserva.
            </p>
          </div>

          <div
            style={{
              ...styles.stepsGrid,
              ...(isMobileView ? styles.singleColumnGrid : {}),
            }}
          >
            <div style={styles.stepCard}>
              <span style={styles.stepNumber}>01</span>
              <h3 style={styles.stepTitle}>Tria el dia</h3>
              <p style={styles.stepText}>
                Consulta la data que t’interessa i accedeix a la disponibilitat
                real del sistema.
              </p>
            </div>

            <div style={styles.stepCard}>
              <span style={styles.stepNumber}>02</span>
              <h3 style={styles.stepTitle}>Escull pista i franja</h3>
              <p style={styles.stepText}>
                Compara opcions i selecciona la reserva que millor et vagi.
              </p>
            </div>

            <div style={styles.stepCard}>
              <span style={styles.stepNumber}>03</span>
              <h3 style={styles.stepTitle}>Gestiona-ho tot</h3>
              <p style={styles.stepText}>
                Revisa el teu historial, cancel·la reserves o actualitza el teu
                perfil amb una UX més cuidada.
              </p>
            </div>
          </div>
        </section>

        <section className="fade-in-up delay-3" style={styles.ctaSection}>
          <div
            style={{
              ...styles.ctaCard,
              ...(isMobileView ? styles.ctaCardMobile : {}),
            }}
          >
            <div>
              <span style={styles.ctaKicker}>Preparat per provar-ho?</span>
              <h2 style={styles.ctaTitle}>Entra i comença a explorar PadelBook</h2>
              <p style={styles.ctaText}>
                Aquesta és només la primera passa del canvi visual. A partir
                d’aquí podem dur aquest mateix estil a login, register,
                disponibilitat, reserves i admin.
              </p>
            </div>

            <div
              style={{
                ...styles.ctaActions,
                ...(isMobileView ? styles.actionsMobile : {}),
              }}
            >
              <Link
                to="/availability"
                className="btn btn-primary"
                style={isMobileView ? styles.fullWidthButton : undefined}
              >
                Veure disponibilitat
              </Link>

              <Link
                to="/login"
                className="btn btn-light"
                style={isMobileView ? styles.fullWidthButton : undefined}
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
    position: "relative",
    overflow: "hidden",
    borderRadius: "32px",
    padding: "2rem",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.58))",
    border: "1px solid rgba(255,255,255,0.55)",
    boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
    backdropFilter: "blur(12px)",
  },

  heroMobile: {
    padding: "1.15rem",
    borderRadius: "24px",
  },

  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "2rem",
    alignItems: "center",
  },

  heroGridMobile: {
    gridTemplateColumns: "1fr",
  },

  heroContent: {
    position: "relative",
    zIndex: 2,
  },

  heroTopLine: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },

  title: {
    marginBottom: "1rem",
    maxWidth: "760px",
    color: "#0f172a",
  },

  titleMobile: {
    fontSize: "2.45rem",
    lineHeight: 1.02,
  },

  subtitle: {
    fontSize: "1.08rem",
    maxWidth: "700px",
    marginBottom: "1.6rem",
    color: "#475569",
  },

  actions: {
    display: "flex",
    gap: "0.9rem",
    flexWrap: "wrap",
    marginBottom: "1.8rem",
  },

  actionsMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  fullWidthButton: {
    width: "100%",
  },

  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "0.9rem",
  },

  metricsMobile: {
    gridTemplateColumns: "1fr",
  },

  metricCard: {
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "20px",
    padding: "1rem",
    boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },

  metricValue: {
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#0f172a",
  },

  metricLabel: {
    color: "#64748b",
    lineHeight: 1.5,
    fontSize: "0.95rem",
  },

  heroVisual: {
    position: "relative",
    minHeight: "480px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },

  mockupCard: {
    width: "100%",
    maxWidth: "420px",
    background: "linear-gradient(180deg, #f8fafc, #ffffff)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "30px",
    padding: "1.25rem",
    boxShadow: "0 24px 48px rgba(15,23,42,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  mockupTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },

  mockupCourtBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.5rem 0.9rem",
    borderRadius: "999px",
    background: "#e0f2fe",
    color: "#0369a1",
    fontWeight: "800",
    fontSize: "0.95rem",
  },

  mockupToday: {
    color: "#64748b",
    fontWeight: "800",
    fontSize: "0.95rem",
  },

  mockupCourt: {
    position: "relative",
    height: "220px",
    borderRadius: "24px",
    background: "linear-gradient(180deg, #157a6e, #136b62)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
    overflow: "hidden",
  },

  courtLineVertical: {
    position: "absolute",
    top: "16px",
    bottom: "16px",
    left: "50%",
    width: "3px",
    transform: "translateX(-50%)",
    background: "rgba(255,255,255,0.85)",
    borderRadius: "999px",
  },

  courtLineHorizontal: {
    position: "absolute",
    left: "16px",
    right: "16px",
    top: "50%",
    height: "3px",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.85)",
    borderRadius: "999px",
  },

  courtCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "48px",
    height: "48px",
    transform: "translate(-50%, -50%)",
    border: "3px solid rgba(255,255,255,0.9)",
    borderRadius: "50%",
  },

  mockupSlots: {
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
  },

  mockupSlotRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.9rem 1rem",
    borderRadius: "18px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  mockupHour: {
    fontSize: "1rem",
    fontWeight: "800",
    color: "#0f172a",
  },

  slotFree: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "88px",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#15803d",
    fontWeight: "800",
    fontSize: "0.9rem",
  },

  slotReserved: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "88px",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: "800",
    fontSize: "0.9rem",
  },

  mockupBottomCards: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "0.85rem",
  },

  mockupMiniCard: {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(148,163,184,0.16)",
    borderRadius: "22px",
    padding: "1rem",
    boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
  },

  mockupMiniEyebrow: {
    display: "inline-block",
    marginBottom: "0.35rem",
    color: "#2563eb",
    fontWeight: "800",
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  mockupMiniTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "1.05rem",
    lineHeight: 1.3,
  },

  mockupMiniText: {
    marginTop: "0.45rem",
    marginBottom: 0,
    color: "#64748b",
    lineHeight: 1.6,
    fontSize: "0.95rem",
  },

  visualMainCard: {
    width: "100%",
    maxWidth: "420px",
    background: "linear-gradient(180deg, #ffffff, #f8fbff)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: "28px",
    padding: "1.2rem",
    boxShadow: "0 28px 60px rgba(37,99,235,0.14)",
    position: "relative",
    zIndex: 2,
  },

  visualTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },

  visualPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.5rem 0.8rem",
    borderRadius: "999px",
    background: "#e0f2fe",
    color: "#0369a1",
    fontWeight: "800",
    fontSize: "0.85rem",
  },

  visualMiniText: {
    color: "#64748b",
    fontWeight: "700",
    fontSize: "0.88rem",
  },

  visualCourt: {
    background: "linear-gradient(180deg, #0f766e, #115e59)",
    borderRadius: "22px",
    padding: "1rem",
    minHeight: "220px",
    marginBottom: "1rem",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
  },

  courtInner: {
    position: "relative",
    height: "100%",
    minHeight: "188px",
    borderRadius: "18px",
    border: "3px solid rgba(255,255,255,0.88)",
  },

  courtLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: "3px",
    transform: "translateX(-50%)",
    background: "rgba(255,255,255,0.88)",
  },

  courtLineHorizontal: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: "3px",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.88)",
  },

  courtCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    border: "3px solid rgba(255,255,255,0.88)",
  },

  slotList: {
    display: "grid",
    gap: "0.65rem",
  },

  slotItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "0.85rem 0.95rem",
    fontWeight: "700",
    color: "#0f172a",
  },

  slotBadgeOk: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "999px",
    padding: "0.35rem 0.7rem",
    fontSize: "0.8rem",
    fontWeight: "800",
  },

  slotBadgeBusy: {
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "999px",
    padding: "0.35rem 0.7rem",
    fontSize: "0.8rem",
    fontWeight: "800",
  },

  floatingLabel: {
    display: "inline-block",
    marginBottom: "0.45rem",
    fontSize: "0.78rem",
    fontWeight: "800",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  floatingTitle: {
    display: "block",
    marginBottom: "0.35rem",
    color: "#0f172a",
    fontSize: "1rem",
  },

  floatingText: {
    margin: 0,
    color: "#64748b",
    fontSize: "0.9rem",
    lineHeight: 1.6,
  },

  section: {
    marginTop: "2.7rem",
  },

  sectionHeader: {
    marginBottom: "1.25rem",
    maxWidth: "760px",
  },

  sectionKicker: {
    display: "inline-block",
    marginBottom: "0.8rem",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    background: "rgba(37,99,235,0.09)",
    color: "#1d4ed8",
    fontWeight: "800",
    fontSize: "0.82rem",
    letterSpacing: "0.02em",
  },

  sectionTitle: {
    marginBottom: "0.55rem",
    color: "#0f172a",
  },

  sectionText: {
    margin: 0,
    fontSize: "1rem",
    color: "#64748b",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "1rem",
  },

  singleColumnGrid: {
    gridTemplateColumns: "1fr",
  },

  featureCard: {
    background: "rgba(255,255,255,0.84)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "24px",
    padding: "1.35rem",
    boxShadow: "0 16px 34px rgba(15,23,42,0.05)",
    backdropFilter: "blur(10px)",
  },

  featureIconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
  },

  featureIcon: {
    fontSize: "1.4rem",
  },

  featureTitle: {
    marginBottom: "0.55rem",
    color: "#0f172a",
  },

  featureText: {
    margin: 0,
    color: "#64748b",
  },

  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "1rem",
  },

  galleryCard: {
    position: "relative",
    minHeight: "280px",
    borderRadius: "28px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.45)",
    boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
    display: "flex",
    alignItems: "flex-end",
  },

  galleryCardBlue: {
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 28%), linear-gradient(135deg, #2563eb, #0f172a)",
  },

  galleryCardGreen: {
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 28%), linear-gradient(135deg, #10b981, #0f766e)",
  },

  galleryCardDark: {
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.14), transparent 28%), linear-gradient(135deg, #1e293b, #0f172a)",
  },

  galleryOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.58) 100%)",
  },

  galleryContent: {
    position: "relative",
    zIndex: 2,
    padding: "1.4rem",
    color: "white",
  },

  galleryBadge: {
    display: "inline-flex",
    marginBottom: "0.7rem",
    padding: "0.42rem 0.7rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.2)",
    fontWeight: "800",
    fontSize: "0.8rem",
  },

  galleryTitle: {
    marginBottom: "0.45rem",
    color: "white",
  },

  galleryText: {
    margin: 0,
    color: "rgba(255,255,255,0.86)",
  },

  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "1rem",
  },

  stepCard: {
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "24px",
    padding: "1.35rem",
    boxShadow: "0 16px 34px rgba(15,23,42,0.05)",
  },

  stepNumber: {
    display: "inline-flex",
    marginBottom: "0.9rem",
    padding: "0.42rem 0.7rem",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: "800",
    fontSize: "0.84rem",
  },

  stepTitle: {
    marginBottom: "0.45rem",
    color: "#0f172a",
  },

  stepText: {
    margin: 0,
    color: "#64748b",
  },

  ctaSection: {
    marginTop: "2.8rem",
  },

  ctaCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(37,99,235,0.92))",
    borderRadius: "30px",
    padding: "1.8rem",
    boxShadow: "0 26px 52px rgba(37,99,235,0.18)",
  },

  ctaCardMobile: {
    padding: "1.25rem",
    borderRadius: "22px",
  },

  ctaKicker: {
    display: "inline-block",
    marginBottom: "0.8rem",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "white",
    fontWeight: "800",
    fontSize: "0.82rem",
  },

  ctaTitle: {
    marginBottom: "0.55rem",
    color: "white",
    maxWidth: "680px",
  },

  ctaText: {
    margin: 0,
    color: "rgba(255,255,255,0.84)",
    maxWidth: "760px",
  },

  ctaActions: {
    display: "flex",
    gap: "0.9rem",
    flexWrap: "wrap",
  },
};

export default HomePage;