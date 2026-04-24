import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "../../assets/images/padelcourt1.jpg";
import court2Img from "../../assets/images/padelcourt2.jpg";
import court3Img from "../../assets/images/padelcourt3.jpg";
import ballsImg from "../../assets/images/padelballs.webp";
import "./HomePage.css";
import padelCourtMockup from "../../assets/images/padelcourt.png";

function HomePage() {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 900);
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);

  // Comprovem si l'usuari està loguejat només una vegada al carregar la pàgina
  const isLoggedIn = useMemo(() => {
    return Boolean(localStorage.getItem("token"));
  }, []);

  // Afegim un event listener per actualitzar l'estat quan la finestra es redimensiona
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 900);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courtsRes = await fetch("http://localhost:3000/api/courts");
        const courtsData = await courtsRes.json();

        const slotsRes = await fetch("http://localhost:3000/api/timeslots");
        const slotsData = await slotsRes.json();

        setCourts(courtsData);
        setSlots(slotsData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const court = courts[0];
  const courtSlots = slots
    .filter((s) => s.court_id === court?.id)
    .slice(0, 3);

  return (
    <div className="home__page">
      <div
        className={`home__container ${isMobileView ? "home__container--mobile" : ""}`}
      >
        <section
          className={`fade-in-up home__hero ${isMobileView ? "home__hero--mobile" : ""}`}
        >
          <div className="home__hero-bg">
            <img src={heroImg} alt="Padel court" />
            <div className="home__hero-overlay" />
          </div>

          <div
            className={`home__hero-grid ${isMobileView ? "home__hero-grid--mobile" : ""}`}
          >
            <div className="home__hero-content">
              <div className="home__hero-top-line">
                <span className="pb-chip">Plataforma moderna de reserves</span>
                <span className="pb-chip">UX clara i ràpida</span>
              </div>

              <h1
                className={`home__title ${isMobileView ? "home__title--mobile" : ""}`}
              >
                Reserva pistes de pàdel amb una experiència més elegant, clara i
                agradable
              </h1>

              <p className="home__subtitle">
                PadelBook és una aplicació web pensada perquè consultar
                disponibilitat, reservar i gestionar pistes sigui fàcil, visual i
                intuitiu. Menys fricció, més sensació de producte real.
              </p>

              <div
                className={`home__actions ${isMobileView ? "home__actions--mobile" : ""}`}
              >
                <Link
                  to="/availability"
                  className={`btn btn-primary ${isMobileView ? "home__full-width-button" : ""}`}
                >
                  Explorar disponibilitat
                </Link>

                {!isLoggedIn && (
                  <Link
                    to="/register"
                    className={`btn btn-light ${isMobileView ? "home__full-width-button" : ""}`}
                  >
                    Crear compte
                  </Link>
                )}
              </div>

              <div
                className={`home__metrics ${isMobileView ? "home__metrics--mobile" : ""}`}
              >
                <div className="home__metric-card">
                  <span className="home__metric-value">24/7</span>
                  <span className="home__metric-label">Consulta online</span>
                </div>

                <div className="home__metric-card">
                  <span className="home__metric-value">UX</span>
                  <span className="home__metric-label">Reserva més clara</span>
                </div>

                <div className="home__metric-card">
                  <span className="home__metric-value">Ràpid</span>
                  <span className="home__metric-label">Flux sense embolics</span>
                </div>
              </div>
            </div>

            <div className="home__hero-visual">
              <div className="home__mockup-card">
                <div className="home__mockup-top">
                  <span className="home__mockup-court-badge">
                    {court ? `${court.name} · Disponible` : "Carregant..."}
                  </span>
                  <span className="home__mockup-today">Avui</span>
                </div>

                <div className="home__mockup-court">
                  <img src={padelCourtMockup} alt="Pista de pàdel" />
                </div>

                <div className="home__mockup-slots">
                  {courtSlots.map((slot) => (
                    <div key={slot.id} className="home__mockup-slot-row">
                      <span className="home__mockup-hour">
                        {slot.start_time}
                      </span>

                      <span
                        className={
                          slot.is_reserved
                            ? "home__slot-reserved"
                            : "home__slot-free"
                        }
                      >
                        {slot.is_reserved ? "Reservada" : "Lliure"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="home__mockup-bottom-cards">
                  <div className="home__mockup-mini-card">
                    <span className="home__mockup-mini-eyebrow">Experiència</span>
                    <h4 className="home__mockup-mini-title">Visual i intuïtiva</h4>
                    <p className="home__mockup-mini-text">
                      Tot més ordenat, més net i amb millor sensació d’ús.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fade-in-up delay-1 home__section">
          <div className="home__section-header">
            <span className="home__section-kicker">Per què PadelBook?</span>
            <h2 className="home__section-title">Una entrada clara al món de les reserves de pàdel</h2>
            <p className="home__section-text">
              La pàgina d’inici està pensada per mostrar des del primer moment
              què pots fer dins PadelBook: consultar disponibilitat, reservar
              pistes i gestionar les teves reserves de manera ràpida i visual.
            </p>
          </div>

          <div
            className={`home__feature-grid ${isMobileView ? "home__single-column-grid" : ""}`}
          >
            <article className="home__feature-card">
              <div className="home__feature-icon-wrap">
                <span className="home__feature-icon">🎯</span>
              </div>
              <h3 className="home__feature-title">Claredat immediata</h3>
              <p className="home__feature-text">
                L’usuari entén ràpidament què pot fer: mirar disponibilitat,
                reservar i gestionar el seu compte.
              </p>
            </article>

            <article className="home__feature-card">
              <div className="home__feature-icon-wrap">
                <span className="home__feature-icon">✨</span>
              </div>
              <h3 className="home__feature-title">Aspecte més premium</h3>
              <p className="home__feature-text">
                Fons suaus, targetes amb profunditat, botons arrodonits i una
                tipografia més moderna.
              </p>
            </article>

            <article className="home__feature-card">
              <div className="home__feature-icon-wrap">
                <span className="home__feature-icon">📱</span>
              </div>
              <h3 className="home__feature-title">Més agradable en mòbil</h3>
              <p className="home__feature-text">
                La disposició s’adapta millor i els blocs tenen més aire i més
                ordre visual.
              </p>
            </article>
          </div>
        </section>

        <section className="fade-in-up delay-2 home__section">
          <div className="home__section-header">
            <span className="home__section-kicker">Què hi trobaràs?</span>
            <h2 className="home__section-title">Tres àrees clau per reservar, consultar i gestionar</h2>
            <p className="home__section-text">
              PadelBook agrupa les accions principals en tres blocs molt clars:
              veure disponibilitat, fer reserves i tenir el control del teu
              compte i historial dins un mateix entorn.
            </p>
          </div>

          <div
            className={`home__gallery-grid ${isMobileView ? "home__single-column-grid" : ""}`}
          >
            <article className="home__gallery-card">
              <img src={court2Img} alt="Consulta" className="home__gallery-img" />
              <div className="home__gallery-overlay" />
              <div className="home__gallery-content">
                <span className="home__gallery-badge">Consulta</span>
                <h3 className="home__gallery-title">Disponibilitat clara</h3>
                <p className="home__gallery-text">
                  Mira pistes i franges horàries amb una lectura molt més còmoda.
                </p>
              </div>
            </article>

            <article className="home__gallery-card">
              <img src={court3Img} alt="Reserva" className="home__gallery-img" />
              <div className="home__gallery-overlay" />
              <div className="home__gallery-content">
                <span className="home__gallery-badge">Reserva</span>
                <h3 className="home__gallery-title">Accions més directes</h3>
                <p className="home__gallery-text">
                  El flux se centra en fer les coses ràpid i sense confusió.
                </p>
              </div>
            </article>

            <article className="home__gallery-card">
              <img src={ballsImg} alt="Compte" className="home__gallery-img" />
              <div className="home__gallery-overlay" />
              <div className="home__gallery-content">
                <span className="home__gallery-badge">Compte</span>
                <h3 className="home__gallery-title">Gestió personal</h3>
                <p className="home__gallery-text">
                  Perfil, historial i informació de l’usuari dins una experiència
                  coherent.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="fade-in-up delay-3 home__section">
          <div className="home__section-header">
            <span className="home__section-kicker">Com funciona</span>
            <h2 className="home__section-title">Un procés simple i agradable</h2>
            <p className="home__section-text">
              L’objectiu és que l’usuari no pensi massa: entra, mira, tria i
              reserva.
            </p>
          </div>

          <div
            className={`home__steps-grid ${isMobileView ? "home__single-column-grid" : ""}`}
          >
            <div className="home__step-card">
              <span className="home__step-number">01</span>
              <h3 className="home__step-title">Tria el dia</h3>
              <p className="home__step-text">
                Consulta la data que t’interessa i accedeix a la disponibilitat
                real del sistema.
              </p>
            </div>

            <div className="home__step-card">
              <span className="home__step-number">02</span>
              <h3 className="home__step-title">Escull pista i franja</h3>
              <p className="home__step-text">
                Compara opcions i selecciona la reserva que millor et vagi.
              </p>
            </div>

            <div className="home__step-card">
              <span className="home__step-number">03</span>
              <h3 className="home__step-title">Gestiona-ho tot</h3>
              <p className="home__step-text">
                Revisa el teu historial, cancel·la reserves o actualitza el teu
                perfil amb una UX més cuidada.
              </p>
            </div>
          </div>
        </section>

        <section className="fade-in-up delay-3 home__cta-section">
          <div
            className={`home__cta-card ${isMobileView ? "home__cta-card--mobile" : ""}`}
          >
            <div className="home__cta-bg">
              <img src={heroImg} alt="" />
              <div className="home__cta-overlay" />
            </div>

            <div className="home__cta-content">
              <span className="home__cta-kicker">
                {isLoggedIn ? "Benvingut de nou" : "Preparat per provar-ho?"}
              </span>

              <h2 className="home__cta-title">
                {isLoggedIn
                  ? "Continua gestionant les teves reserves"
                  : "Entra i comença a explorar PadelBook"}
              </h2>

              <p className="home__cta-text">
                {isLoggedIn
                  ? "Accedeix a les teves reserves, consulta disponibilitat i gestiona-ho tot de forma ràpida i clara."
                  : "Descobreix pistes disponibles, reserva en pocs passos i comença a gestionar el teu joc dins una experiència més moderna i ordenada."}
              </p>
            </div>

            <div
              className={`home__cta-actions ${isMobileView ? "home__actions--mobile" : ""}`}
            >
              <Link
                to="/availability"
                className={`btn btn-primary ${isMobileView ? "home__full-width-button" : ""}`}
              >
                Veure disponibilitat
              </Link>

              {!isLoggedIn && (
                <Link
                  to="/login"
                  className={`btn btn-light ${isMobileView ? "home__full-width-button" : ""}`}
                >
                  Iniciar sessió
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;