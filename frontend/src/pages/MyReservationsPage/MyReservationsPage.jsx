import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import ReservationCard from "../../components/ReservationCard/ReservationCard";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import "./MyReservationsPage.css";

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
  const [deletingCancelledReservationId, setDeletingCancelledReservationId] =
    useState(null);
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

  const handleDeleteCancelled = async (id) => {
    try {
      setDeletingCancelledReservationId(id);

      const response = await api.delete(`/reservations/${id}/permanent`);

      setReservations((prev) => prev.filter((reservation) => reservation.id !== id));

      if (confirmingReservationId === id) {
        setConfirmingReservationId(null);
      }

      showFeedbackMessage(
        response?.data?.message ||
          "Reserva cancel·lada eliminada correctament.",
        "success"
      );

      scrollToFeedback();
    } catch (err) {
      console.error(err);

      const backendError =
        err.response?.data?.error ||
        "No s'ha pogut eliminar la reserva cancel·lada.";

      showFeedbackMessage(backendError, "error");
      scrollToFeedback();
    } finally {
      setDeletingCancelledReservationId(null);
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

  const totalSpent = useMemo(() => {
    return reservations.reduce((sum, reservation) => {
      const amount =
        reservation.preu_total != null
          ? Number(reservation.preu_total)
          : reservation.preu != null
          ? Number(reservation.preu)
          : 0;

      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);
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
    <div className="my-res__page">
      <div
        className={`my-res__container ${isMobileView ? "my-res__container--mobile" : ""}`}
      >
        <section
          className={`fade-in-up my-res__hero ${isMobileView ? "my-res__hero--mobile" : ""}`}
        >
          <div
            className={`my-res__hero-grid ${isMobileView ? "my-res__hero-grid--mobile" : ""}`}
          >
            <div>
              <span className="pb-chip">Gestió de reserves</span>
              <h1
                className={`my-res__title ${isMobileView ? "my-res__title--mobile" : ""}`}
              >
                Les meves reserves
              </h1>
              <p className="my-res__subtitle">
                Consulta el teu historial, revisa les reserves actives i gestiona
                les cancel·lacions dins una vista més ordenada i agradable.
              </p>
            </div>

            {!loading && !error && reservations.length > 0 && (
              <div className="my-res__hero-stats">
                <div className="my-res__stat-card">
                  <span className="my-res__stat-number">{reservations.length}</span>
                  <span className="my-res__stat-label">Reserves totals</span>
                </div>

                <div className="my-res__stat-card">
                  <span className="my-res__stat-number">{activeReservations.length}</span>
                  <span className="my-res__stat-label">Actives</span>
                </div>

                <div className="my-res__stat-card">
                  <span className="my-res__stat-number">
                    {cancelledReservations.length}
                  </span>
                  <span className="my-res__stat-label">Cancel·lades</span>
                </div>

                <div className="my-res__stat-card">
                  <span className="my-res__stat-number">{totalSpent.toFixed(2)}€</span>
                  <span className="my-res__stat-label">Import total</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <div ref={topFeedbackRef} />

        {feedback && (
          <section className="scale-in my-res__feedback-section">
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
          <section className="scale-in my-res__feedback-section">
            <div className="pb-feedback pb-feedback--error my-res__error-wrapper">
              <p className="my-res__error-title">No s'han pogut carregar les reserves</p>
              <p className="my-res__error-text">{error}</p>

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
              className="fade-in-up delay-1 pb-surface-card my-res__summary-section"
            >
              <div
                className={`my-res__section-header ${isMobileView ? "my-res__section-header--mobile" : ""}`}
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
                className={`my-res__segmented ${isMobileView ? "my-res__segmented--mobile" : ""}`}
              >
                <button
                  type="button"
                  className={`my-res__segmented-btn ${
                    activeFilter === "all" ? "is-active" : ""
                  }`}
                  onClick={() => handleFilterChange("all")}
                >
                  <span className="my-res__segmented-label">Totes</span>
                  <span className="my-res__segmented-count">{reservations.length}</span>
                </button>

                <button
                  type="button"
                  className={`my-res__segmented-btn ${
                    activeFilter === "active" ? "is-active" : ""
                  }`}
                  onClick={() => handleFilterChange("active")}
                >
                  <span className="my-res__segmented-label">Actives</span>
                  <span className="my-res__segmented-count">{activeReservations.length}</span>
                </button>

                <button
                  type="button"
                  className={`my-res__segmented-btn ${
                    activeFilter === "cancelled" ? "is-active" : ""
                  }`}
                  onClick={() => handleFilterChange("cancelled")}
                >
                  <span className="my-res__segmented-label">Cancel·lades</span>
                  <span className="my-res__segmented-count">{cancelledReservations.length}</span>
                </button>
              </div>
            </section>

            {filteredReservations.length > 0 ? (
              <section className="fade-in-up delay-2 my-res__grid">
                {filteredReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className={
                      recentlyCancelledReservationId === reservation.id
                        ? "my-res__recently-cancelled-wrapper"
                        : undefined
                    }
                  >
                    <ReservationCard
                      reservation={reservation}
                      onCancel={handleCancel}
                      onDeleteCancelled={handleDeleteCancelled}
                      isCancelling={cancellingReservationId === reservation.id}
                      isDeletingCancelled={
                        deletingCancelledReservationId === reservation.id
                      }
                      confirmingCancel={confirmingReservationId === reservation.id}
                      onStartCancel={setConfirmingReservationId}
                      onAbortCancel={() => setConfirmingReservationId(null)}
                    />
                  </div>
                ))}
              </section>
            ) : (
              <section className="scale-in pb-surface-card my-res__filtered-empty-state">
                <span className="my-res__filtered-empty-icon">🔎</span>
                <h3 className="my-res__filtered-empty-title">
                  No hi ha reserves en aquest filtre
                </h3>
                <p className="my-res__filtered-empty-text">
                  Canvia el filtre per veure altres reserves del teu historial.
                </p>

                <div className="my-res__filtered-empty-actions">
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
          <section className="scale-in pb-surface-card my-res__empty-state">
            <span className="my-res__empty-icon">📅</span>
            <h3 className="my-res__empty-title">Encara no tens cap reserva</h3>
            <p className="my-res__empty-text">
              Quan reservis una pista, aquí podràs veure l’historial, consultar
              la informació i cancel·lar-la si és necessari.
            </p>

            <div
              className={`my-res__empty-actions ${isMobileView ? "my-res__empty-actions--mobile" : ""}`}
            >
              <Link
                to="/availability"
                className="btn btn-primary"
              >
                Veure disponibilitat
              </Link>

              <Link
                to="/"
                className="btn btn-light"
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

export default MyReservationsPage;