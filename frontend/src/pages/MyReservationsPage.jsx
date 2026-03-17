import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ReservationCard from "../components/ReservationCard";
import LoadingSpinner from "../components/LoadingSpinner";

function MyReservationsPage() {
  const topFeedbackRef = useRef(null);

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

  const scrollToFeedback = () => {
    if (!topFeedbackRef.current) return;

    const top =
      topFeedbackRef.current.getBoundingClientRect().top + window.scrollY - 150;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
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
      setError("Error obtenint les reserves");
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
  }, [
    activeFilter,
    reservations,
    activeReservations,
    cancelledReservations,
  ]);

  const filterLabel = useMemo(() => {
    if (activeFilter === "active") return "actives";
    if (activeFilter === "cancelled") return "cancel·lades";
    return "totals";
  }, [activeFilter]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <section className="fade-in-up" style={styles.hero}>
          <span style={styles.badge}>Gestió de reserves</span>
          <h1 style={styles.title}>Les meves reserves</h1>
          <p style={styles.subtitle}>
            Consulta l’historial de reserves actives i cancel·lades, i gestiona
            fàcilment les teves pistes reservades.
          </p>

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
        </section>

        <div ref={topFeedbackRef} />

        {feedback && (
          <section className="scale-in" style={styles.feedbackSection}>
            <div
              style={{
                ...styles.feedbackBox,
                ...(feedbackType === "success"
                  ? styles.feedbackSuccess
                  : styles.feedbackError),
              }}
            >
              <p style={styles.feedbackText}>{feedback}</p>
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
            <div style={styles.errorBox}>
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
            <section className="fade-in-up delay-1" style={styles.summarySection}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Historial de reserves</h2>
                  <p style={styles.sectionText}>
                    Filtra ràpidament les teves reserves per veure només les que
                    tens actives o les que ja has cancel·lat.
                  </p>
                </div>

                <span style={styles.countBadge}>
                  {filteredReservations.length} {filterLabel}
                </span>
              </div>

              <div style={styles.filtersRow}>
                <button
                  type="button"
                  className={`btn ${
                    activeFilter === "all" ? "btn-primary" : "btn-light"
                  }`}
                  onClick={() => setActiveFilter("all")}
                  style={styles.filterButton}
                >
                  Totes ({reservations.length})
                </button>

                <button
                  type="button"
                  className={`btn ${
                    activeFilter === "active" ? "btn-primary" : "btn-light"
                  }`}
                  onClick={() => setActiveFilter("active")}
                  style={styles.filterButton}
                >
                  Actives ({activeReservations.length})
                </button>

                <button
                  type="button"
                  className={`btn ${
                    activeFilter === "cancelled" ? "btn-primary" : "btn-light"
                  }`}
                  onClick={() => setActiveFilter("cancelled")}
                  style={styles.filterButton}
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
                    style={{
                      ...(recentlyCancelledReservationId === reservation.id
                        ? styles.recentlyCancelledWrapper
                        : {}),
                    }}
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
              <section className="scale-in" style={styles.filteredEmptyState}>
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
                    onClick={() => setActiveFilter("all")}
                  >
                    Veure totes les reserves
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        {!loading && !error && reservations.length === 0 && (
          <section className="scale-in" style={styles.emptyState}>
            <span style={styles.emptyIcon}>📅</span>
            <h3 style={styles.emptyTitle}>Encara no tens cap reserva</h3>
            <p style={styles.emptyText}>
              Quan reservis una pista, aquí podràs veure l’historial, consultar
              la informació i cancel·lar-la si és necessari.
            </p>

            <div style={styles.emptyActions}>
              <Link
                to="/availability"
                className="btn btn-primary"
                style={styles.emptyPrimary}
              >
                Veure disponibilitat
              </Link>

              <Link
                to="/"
                className="btn btn-light"
                style={styles.emptySecondary}
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
  hero: {
    background: "linear-gradient(135deg, #1e40af, #2563eb)",
    color: "white",
    padding: "2rem",
    borderRadius: "18px",
    marginBottom: "1.75rem",
    boxShadow: "0 10px 24px rgba(37,99,235,0.22)",
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
    margin: 0,
    fontSize: "2.5rem",
  },
  subtitle: {
    marginTop: "0.75rem",
    marginBottom: 0,
    fontSize: "1.05rem",
    lineHeight: 1.7,
    opacity: 0.96,
    maxWidth: "760px",
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.9rem",
    marginTop: "1.5rem",
  },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "16px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  statNumber: {
    fontSize: "1.4rem",
    fontWeight: "800",
  },
  statLabel: {
    opacity: 0.92,
    lineHeight: 1.5,
  },
  feedbackSection: {
    marginTop: "1.25rem",
    marginBottom: "1.25rem",
  },
  feedbackBox: {
    borderRadius: "16px",
    padding: "1rem 1.1rem",
    border: "1px solid transparent",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },
  feedbackSuccess: {
    backgroundColor: "#ecfdf5",
    borderColor: "#86efac",
  },
  feedbackError: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  feedbackText: {
    margin: 0,
    fontWeight: "700",
    lineHeight: 1.6,
    color: "#0f172a",
  },
  errorBox: {
    backgroundColor: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "18px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
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
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.8rem",
    color: "#0f172a",
  },
  sectionText: {
    marginTop: "0.45rem",
    marginBottom: 0,
    color: "#475569",
    lineHeight: 1.65,
  },
  countBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.95rem",
  },
  filtersRow: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  filterButton: {
    minWidth: "140px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1rem",
  },
  recentlyCancelledWrapper: {
    borderRadius: "18px",
    boxShadow: "0 0 0 4px rgba(239,68,68,0.12)",
    transition: "all 0.2s ease",
  },
  filteredEmptyState: {
    marginTop: "1rem",
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "2rem",
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
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
    color: "#4b5563",
    lineHeight: 1.7,
    maxWidth: "620px",
  },
  filteredEmptyActions: {
    marginTop: "1.4rem",
  },
  emptyState: {
    marginTop: "2rem",
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "2rem",
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
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
    color: "#4b5563",
    lineHeight: 1.7,
    maxWidth: "680px",
  },
  emptyActions: {
    display: "flex",
    justifyContent: "center",
    gap: "0.8rem",
    flexWrap: "wrap",
    marginTop: "1.5rem",
  },
  emptyPrimary: {},
  emptySecondary: {},
};

export default MyReservationsPage;