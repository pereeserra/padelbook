import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ReservationCard from "../components/ReservationCard";
import LoadingSpinner from "../components/LoadingSpinner";

function MyReservationsPage() {
  const topFeedbackRef = useRef(null);
  const summaryRef = useRef(null);

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [hasInteractedWithFilter, setHasInteractedWithFilter] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [confirmingReservationId, setConfirmingReservationId] = useState(null);
  const [cancellingReservationId, setCancellingReservationId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [recentlyCancelledReservationId, setRecentlyCancelledReservationId] =
    useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToFeedback = () => {
    if (!topFeedbackRef.current) return;

    const top =
      topFeedbackRef.current.getBoundingClientRect().top + window.scrollY - 150;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  const scrollToSummary = () => {
    if (!summaryRef.current) return;

    const top =
      summaryRef.current.getBoundingClientRect().top + window.scrollY - 150;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  const handleFilterChange = (filter) => {
    setHasInteractedWithFilter(true);

    if (activeFilter === filter) {
      setTimeout(() => {
        scrollToSummary();
      }, 60);
      return;
    }

    setActiveFilter(filter);
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reservations");
      const reservationsData = response?.data?.data || [];

      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
    } catch (err) {
      console.error(err);
      setError("Error obtenint les reserves.");
    } finally {
      setLoading(false);
    }
  };

  const showFeedbackMessage = (message, type = "success") => {
    setFeedback(message);
    setFeedbackType(type);

    setTimeout(() => {
      setFeedback("");
    }, 3500);
  };

  const handleCancel = async (id) => {
    try {
      setCancellingReservationId(id);

      const response = await api.delete(`/reservations/${id}`);

      setConfirmingReservationId(null);
      setRecentlyCancelledReservationId(id);

      showFeedbackMessage(
        response?.data?.message || "La reserva s'ha cancel·lat correctament.",
        "success"
      );

      scrollToFeedback();

      await fetchReservations();

      setTimeout(() => {
        setRecentlyCancelledReservationId(null);
      }, 2500);
    } catch (err) {
      console.error(err);

      const backendError =
        err.response?.data?.error ||
        "No s'ha pogut cancel·lar la reserva. Torna-ho a provar.";

      showFeedbackMessage(backendError, "error");
      scrollToFeedback();
    } finally {
      setCancellingReservationId(null);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    if (!hasInteractedWithFilter) return;
    if (!summaryRef.current) return;

    const timeout = setTimeout(() => {
      scrollToSummary();
    }, 60);

    return () => clearTimeout(timeout);
  }, [activeFilter, hasInteractedWithFilter]);

  const activeReservations = useMemo(() => {
    return reservations.filter((reservation) => reservation.estat === "activa");
  }, [reservations]);

  const cancelledReservations = useMemo(() => {
    return reservations.filter((reservation) => reservation.estat !== "activa");
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    if (activeFilter === "active") return activeReservations;
    if (activeFilter === "cancelled") return cancelledReservations;
    return reservations;
  }, [activeFilter, reservations, activeReservations, cancelledReservations]);

  const filterLabel = useMemo(() => {
    if (activeFilter === "active") return "actives";
    if (activeFilter === "cancelled") return "cancel·lades";
    return "totals";
  }, [activeFilter]);

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
            <div>
              <span className="pb-chip">Gestió de reserves</span>
              <h1
                style={{
                  ...styles.title,
                  ...(isMobileView ? styles.titleMobile : {}),
                }}
              >
                Les meves reserves
              </h1>
              <p style={styles.subtitle}>
                Consulta el teu historial, revisa les reserves actives i gestiona
                les cancel·lacions dins una vista més ordenada i agradable.
              </p>
            </div>

            {!loading && !error && reservations.length > 0 && (
              <div style={styles.heroStats}>
                <div style={styles.statCard}>
                  <span style={styles.statNumber}>{reservations.length}</span>
                  <span style={styles.statLabel}>Reserves totals</span>
                </div>

                <div style={styles.statCard}>
                  <span style={styles.statNumber}>{activeReservations.length}</span>
                  <span style={styles.statLabel}>Actives</span>
                </div>

                <div style={styles.statCard}>
                  <span style={styles.statNumber}>
                    {cancelledReservations.length}
                  </span>
                  <span style={styles.statLabel}>Cancel·lades</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <div ref={topFeedbackRef} />

        {feedback && (
          <section className="scale-in" style={styles.feedbackSection}>
            <div
              className={`pb-feedback ${
                feedbackType === "success"
                  ? "pb-feedback--success"
                  : "pb-feedback--error"
              }`}
            >
              <p className="pb-feedback__text">{feedback}</p>
            </div>
          </section>
        )}

        {loading && (
          <LoadingSpinner
            text="Carregant les teves reserves..."
            minHeight="240px"
          />
        )}

        {error && (
          <section className="scale-in" style={styles.feedbackSection}>
            <div className="pb-feedback pb-feedback--error" style={styles.errorWrapper}>
              <p style={styles.errorTitle}>No s'han pogut carregar les reserves</p>
              <p style={styles.errorText}>{error}</p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={fetchReservations}
              >
                Tornar-ho a intentar
              </button>
            </div>
          </section>
        )}

        {!loading && !error && reservations.length > 0 && (
          <>
            <section
              ref={summaryRef}
              className="fade-in-up delay-1 pb-surface-card"
              style={styles.summarySection}
            >
              <div
                style={{
                  ...styles.sectionHeader,
                  ...(isMobileView ? styles.sectionHeaderMobile : {}),
                }}
              >
                <div>
                  <span className="pb-kicker">Historial</span>
                  <h2 className="pb-panel-title">Historial de reserves</h2>
                  <p className="pb-panel-text">
                    Filtra ràpidament entre totes les reserves, les actives i
                    les cancel·lades.
                  </p>
                </div>

                <span className="pb-badge-pill pb-badge-pill--blue">
                  {filteredReservations.length} {filterLabel}
                </span>
              </div>

              <div
                style={{
                  ...styles.filtersRow,
                  ...(isMobileView ? styles.filtersRowMobile : {}),
                }}
              >
                <button
                  type="button"
                  className={`btn ${
                    activeFilter === "all" ? "btn-primary" : "btn-light"
                  }`}
                  onClick={() => handleFilterChange("all")}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Totes ({reservations.length})
                </button>

                <button
                  type="button"
                  className={`btn ${
                    activeFilter === "active" ? "btn-primary" : "btn-light"
                  }`}
                  onClick={() => handleFilterChange("active")}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Actives ({activeReservations.length})
                </button>

                <button
                  type="button"
                  className={`btn ${
                    activeFilter === "cancelled" ? "btn-primary" : "btn-light"
                  }`}
                  onClick={() => handleFilterChange("cancelled")}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Cancel·lades ({cancelledReservations.length})
                </button>
              </div>
            </section>

            {filteredReservations.length > 0 ? (
              <section className="fade-in-up delay-2" style={styles.grid}>
                {filteredReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    style={
                      recentlyCancelledReservationId === reservation.id
                        ? styles.recentlyCancelledWrapper
                        : undefined
                    }
                  >
                    <ReservationCard
                      reservation={reservation}
                      onCancel={handleCancel}
                      isCancelling={cancellingReservationId === reservation.id}
                      confirmingCancel={confirmingReservationId === reservation.id}
                      onStartCancel={setConfirmingReservationId}
                      onAbortCancel={() => setConfirmingReservationId(null)}
                    />
                  </div>
                ))}
              </section>
            ) : (
              <section className="scale-in pb-surface-card" style={styles.filteredEmptyState}>
                <span style={styles.filteredEmptyIcon}>🔎</span>
                <h3 style={styles.filteredEmptyTitle}>
                  No hi ha reserves en aquest filtre
                </h3>
                <p style={styles.filteredEmptyText}>
                  Canvia el filtre per veure altres reserves del teu historial.
                </p>

                <div style={styles.filteredEmptyActions}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleFilterChange("all")}
                  >
                    Veure totes les reserves
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        {!loading && !error && reservations.length === 0 && (
          <section className="scale-in pb-surface-card" style={styles.emptyState}>
            <span style={styles.emptyIcon}>📅</span>
            <h3 style={styles.emptyTitle}>Encara no tens cap reserva</h3>
            <p style={styles.emptyText}>
              Quan reservis una pista, aquí podràs veure l’historial, consultar
              la informació i cancel·lar-la si és necessari.
            </p>

            <div
              style={{
                ...styles.emptyActions,
                ...(isMobileView ? styles.emptyActionsMobile : {}),
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
                to="/"
                className="btn btn-light"
                style={isMobileView ? styles.fullWidthButton : undefined}
              >
                Tornar a inici
              </Link>
            </div>
          </section>
        )}
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
    borderRadius: "30px",
    padding: "2rem",
    marginBottom: "1.5rem",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(37,99,235,0.88))",
    boxShadow: "0 26px 56px rgba(37,99,235,0.16)",
    color: "white",
  },
  heroMobile: {
    padding: "1.25rem",
    borderRadius: "24px",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "1.2rem",
    alignItems: "center",
  },
  heroGridMobile: {
    gridTemplateColumns: "1fr",
  },
  title: {
    margin: "1rem 0 0 0",
    fontSize: "3rem",
    lineHeight: 1.03,
  },
  titleMobile: {
    fontSize: "2.2rem",
  },
  subtitle: {
    marginTop: "0.9rem",
    marginBottom: 0,
    fontSize: "1.05rem",
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.84)",
    maxWidth: "760px",
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "0.8rem",
  },
  statCard: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "20px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  statNumber: {
    fontSize: "1.45rem",
    fontWeight: "800",
  },
  statLabel: {
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.5,
  },
  feedbackSection: {
    marginTop: "1.25rem",
    marginBottom: "1.25rem",
  },
  errorWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },
  errorTitle: {
    margin: 0,
    color: "#9f1239",
    fontWeight: "800",
    fontSize: "1.1rem",
  },
  errorText: {
    margin: 0,
    color: "#881337",
    lineHeight: 1.6,
    fontWeight: "600",
  },
  summarySection: {
    marginTop: "2rem",
    marginBottom: "1rem",
    padding: "1.3rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  sectionHeaderMobile: {
    flexDirection: "column",
  },
  filtersRow: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  filtersRowMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  fullWidthButton: {
    width: "100%",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1rem",
  },
  recentlyCancelledWrapper: {
    borderRadius: "22px",
    boxShadow: "0 0 0 4px rgba(239,68,68,0.10)",
    transition: "all 0.2s ease",
  },
  filteredEmptyState: {
    marginTop: "1rem",
    padding: "2rem",
    textAlign: "center",
  },
  filteredEmptyIcon: {
    fontSize: "2rem",
    display: "inline-block",
    marginBottom: "0.75rem",
  },
  filteredEmptyTitle: {
    marginTop: 0,
    marginBottom: "0.75rem",
    fontSize: "1.4rem",
    color: "#0f172a",
  },
  filteredEmptyText: {
    margin: "0 auto",
    color: "#64748b",
    lineHeight: 1.75,
    maxWidth: "620px",
  },
  filteredEmptyActions: {
    marginTop: "1.4rem",
  },
  emptyState: {
    marginTop: "2rem",
    padding: "2rem",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "2.2rem",
    display: "inline-block",
    marginBottom: "0.75rem",
  },
  emptyTitle: {
    marginTop: 0,
    marginBottom: "0.75rem",
    fontSize: "1.5rem",
    color: "#0f172a",
  },
  emptyText: {
    margin: "0 auto",
    color: "#64748b",
    lineHeight: 1.75,
    maxWidth: "680px",
  },
  emptyActions: {
    display: "flex",
    justifyContent: "center",
    gap: "0.8rem",
    flexWrap: "wrap",
    marginTop: "1.5rem",
  },
  emptyActionsMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
};

export default MyReservationsPage;