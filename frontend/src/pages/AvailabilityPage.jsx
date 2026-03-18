import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AvailabilityTable from "../components/AvailabilityTable";
import AvailabilitySummary from "../components/AvailabilitySummary";
import LoadingSpinner from "../components/LoadingSpinner";

function AvailabilityPage() {
  const navigate = useNavigate();
  const hiddenDateInputRef = useRef(null);
  const resultsRef = useRef(null);
  const topFeedbackRef = useRef(null);
  const shouldScrollToResultsRef = useRef(false);

  const [reservingSlot, setReservingSlot] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const getToday = () => new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(getToday());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [showAuthHelp, setShowAuthHelp] = useState(false);
  const [recentlyReservedSlot, setRecentlyReservedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [reservationSummary, setReservationSummary] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Cap data seleccionada";

    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("ca-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortWeekday = (dateObj) => {
    return dateObj.toLocaleDateString("ca-ES", { weekday: "short" });
  };

  const isPastDate = (selectedDate) => {
    return selectedDate < getToday();
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
    setShowAuthHelp(false);
    setReservationSummary(null);
  };

  const handleOpenDatePicker = () => {
    if (hiddenDateInputRef.current) {
      if (hiddenDateInputRef.current.showPicker) {
        hiddenDateInputRef.current.showPicker();
      } else {
        hiddenDateInputRef.current.click();
      }
    }
  };

  const scrollToElementWithOffset = (element, offset = 110) => {
    if (!element) return;

    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    const targetPosition = elementTop - offset;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  };

  const fetchAvailability = async (selectedDate) => {
    try {
      if (!selectedDate) {
        setError("Has de seleccionar una data.");
        setAvailability([]);
        return;
      }

      if (isPastDate(selectedDate)) {
        setError("No pots consultar disponibilitat de dies anteriors a avui.");
        setAvailability([]);
        return;
      }

      setLoading(true);
      setError("");
      setShowAuthHelp(false);

      const response = await api.get(`/availability?date=${selectedDate}`);
      const availabilityData = response?.data?.data || [];

      setAvailability(Array.isArray(availabilityData) ? availabilityData : []);
    } catch (err) {
      console.error(err);
      setError("Error obtenint la disponibilitat.");
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const changeDay = (amount) => {
    const baseDate = new Date(date);
    baseDate.setDate(baseDate.getDate() + amount);
    const newDate = baseDate.toISOString().split("T")[0];

    if (isPastDate(newDate)) return;

    clearMessages();
    setRecentlyReservedSlot(null);
    shouldScrollToResultsRef.current = false;
    setDate(newDate);
  };

  const handleSetToday = () => {
    clearMessages();
    setRecentlyReservedSlot(null);
    shouldScrollToResultsRef.current = false;
    setDate(getToday());
  };

  const handleManualDateChange = (newDate) => {
    if (!newDate) {
      setDate("");
      setAvailability([]);
      clearMessages();
      return;
    }

    if (isPastDate(newDate)) {
      setError("No pots seleccionar una data anterior a avui.");
      setSuccess("");
      setAvailability([]);
      setRecentlyReservedSlot(null);
      setDate(getToday());
      return;
    }

    clearMessages();
    setRecentlyReservedSlot(null);
    shouldScrollToResultsRef.current = false;
    setDate(newDate);
  };

  const handleReserve = async (slot) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Per reservar una pista, has d'iniciar sessió o crear un compte.");
        setSuccess("");
        setShowAuthHelp(true);
        return;
      }

      clearMessages();

      const slotKey = `${slot.court_id}-${slot.time_slot_id}`;
      setReservingSlot(slotKey);

      const response = await api.post("/reservations", {
        court_id: slot.court_id,
        time_slot_id: slot.time_slot_id,
        data_reserva: date,
        metode_pagament: paymentMethod,
      });

      const reservationData = response?.data?.data || null;

      setSuccess(
        response?.data?.message ||
          `Reserva confirmada a ${slot.nom_pista} (${slot.hora_inici} - ${slot.hora_fi}).`
      );

      setReservationSummary({
        codi_reserva: reservationData?.codi_reserva || "No disponible",
        preu_total:
          reservationData?.preu_total != null
            ? reservationData.preu_total
            : reservationData?.preu != null
            ? reservationData.preu
            : null,
        metode_pagament: reservationData?.metode_pagament || paymentMethod,
        estat_pagament: reservationData?.estat_pagament || "No disponible",
        nom_pista: slot.nom_pista,
        hora_inici: slot.hora_inici,
        hora_fi: slot.hora_fi,
        data_reserva: date,
      });

      setRecentlyReservedSlot({
        court_id: slot.court_id,
        time_slot_id: slot.time_slot_id,
        data_reserva: date,
      });

      setTimeout(() => {
        fetchAvailability(date);
        setReservingSlot(null);
      }, 180);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 409 && err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Error creant la reserva.");
      }

      setSuccess("");
      setReservingSlot(null);
    }
  };

  useEffect(() => {
    fetchAvailability(date);
  }, [date]);

  useEffect(() => {
    if (success) return;
    if (!shouldScrollToResultsRef.current) return;

    if (!loading && availability.length > 0 && resultsRef.current) {
      scrollToElementWithOffset(resultsRef.current, 160);
      shouldScrollToResultsRef.current = false;
    }
  }, [availability, loading, success]);

  useEffect(() => {
    if (!success && !error && !showAuthHelp) return;

    const timeout = setTimeout(() => {
      scrollToElementWithOffset(topFeedbackRef.current, 120);
    }, 80);

    return () => clearTimeout(timeout);
  }, [success, error, showAuthHelp]);

  const filteredAvailability = useMemo(() => {
    if (!showOnlyAvailable) return availability;
    return availability.filter((slot) => slot.disponible);
  }, [availability, showOnlyAvailable]);

  const quickDays = useMemo(() => {
    const start = new Date(getToday());

    return Array.from({ length: 7 }, (_, index) => {
      const current = new Date(start);
      current.setDate(start.getDate() + index);

      return {
        iso: current.toISOString().split("T")[0],
        dayNumber: current.getDate(),
        weekday: formatShortWeekday(current),
        isToday: index === 0,
      };
    });
  }, []);

  const uniqueCourts = [
    ...new Set(filteredAvailability.map((slot) => slot.nom_pista)),
  ];

  const availableCount = filteredAvailability.filter(
    (slot) => slot.disponible
  ).length;

  const occupiedCount = filteredAvailability.length - availableCount;

  const previousDayDisabled = date <= getToday();

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
              <span className="pb-chip">Reserva la teva pista</span>
              <h1
                style={{
                  ...styles.title,
                  ...(isMobileView ? styles.titleMobile : {}),
                }}
              >
                Consulta la disponibilitat d’una manera més clara i visual
              </h1>
              <p style={styles.subtitle}>
                Selecciona un dia, revisa ràpidament quines pistes i franges
                tens disponibles i confirma la teva reserva amb una experiència
                més neta i agradable.
              </p>
            </div>

            <div style={styles.heroDateCard}>
              <span style={styles.heroDateLabel}>Data seleccionada</span>
              <strong style={styles.heroDateValue}>
                {formatDisplayDate(date)}
              </strong>

              <div style={styles.heroDateMeta}>
                <span className="pb-badge-pill pb-badge-pill--blue">
                  {uniqueCourts.length || 0} pistes
                </span>
                <span className="pb-badge-pill pb-badge-pill--blue">
                  {filteredAvailability.length || 0} franges
                </span>
                <span className="pb-badge-pill pb-badge-pill--green">
                  {availableCount || 0} lliures
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="fade-in-up delay-1 pb-surface-card"
          style={{
            ...styles.searchCard,
            ...(isMobileView ? styles.searchCardMobile : {}),
          }}
        >
          <div
            style={{
              ...styles.searchHeader,
              ...(isMobileView ? styles.searchHeaderMobile : {}),
            }}
          >
            <div>
              <span className="pb-kicker">Selecció de dia</span>
              <h2 className="pb-panel-title">Tria el dia que vols jugar</h2>
              <p className="pb-panel-text">
                Pots usar els dies ràpids, canviar un dia enrere o endavant, o
                obrir el selector manual.
              </p>
            </div>

            <div style={styles.selectionHint}>
              <span style={styles.selectionHintLabel}>Vista actual</span>
              <span style={styles.selectionHintValue}>
                Disponibilitat del dia
              </span>
            </div>
          </div>

          <div
            style={{
              ...styles.quickDaysGrid,
              ...(isMobileView ? styles.quickDaysGridMobile : {}),
            }}
          >
            {quickDays.map((day) => (
              <button
                key={day.iso}
                onClick={() => {
                  clearMessages();
                  setRecentlyReservedSlot(null);
                  shouldScrollToResultsRef.current = false;
                  setDate(day.iso);
                }}
                style={{
                  ...styles.quickDayButton,
                  ...(date === day.iso ? styles.quickDayActive : {}),
                }}
              >
                <span style={styles.quickDayWeekday}>{day.weekday}</span>
                <span style={styles.quickDayNumber}>{day.dayNumber}</span>
                <span style={styles.quickDayLabel}>
                  {day.isToday ? "Avui" : "Disponible"}
                </span>
              </button>
            ))}
          </div>

          <div
            style={{
              ...styles.controls,
              ...(isMobileView ? styles.controlsMobile : {}),
            }}
          >
            <button
              onClick={() => changeDay(-1)}
              className={`btn btn-secondary ${
                previousDayDisabled ? "is-disabled" : ""
              }`}
              style={isMobileView ? styles.fullWidthButton : undefined}
              disabled={previousDayDisabled}
            >
              ← Dia anterior
            </button>

            <div
              style={{
                ...styles.datePickerWrapper,
                ...(isMobileView ? styles.datePickerWrapperMobile : {}),
              }}
            >
              <span style={styles.dateInputLabel}>Triar data manualment</span>

              <button
                type="button"
                onClick={handleOpenDatePicker}
                style={{
                  ...styles.customDateButton,
                  ...(isMobileView ? styles.customDateButtonMobile : {}),
                }}
              >
                <span style={styles.customDateText}>
                  {new Date(date).toLocaleDateString("ca-ES")}
                </span>
                <span style={styles.calendarIcon}>📅</span>
              </button>

              <input
                ref={hiddenDateInputRef}
                type="date"
                value={date}
                min={getToday()}
                onChange={(e) => handleManualDateChange(e.target.value)}
                style={styles.hiddenDateInput}
              />
            </div>

            <button
              onClick={() => changeDay(1)}
              className="btn btn-secondary"
              style={isMobileView ? styles.fullWidthButton : undefined}
            >
              Dia següent →
            </button>

            <button
              onClick={handleSetToday}
              className="btn btn-light"
              style={isMobileView ? styles.fullWidthButton : undefined}
            >
              Avui
            </button>

            <button
              onClick={() => {
                clearMessages();
                setRecentlyReservedSlot(null);
                shouldScrollToResultsRef.current = true;
                fetchAvailability(date);
              }}
              className="btn btn-primary"
              style={isMobileView ? styles.fullWidthButton : undefined}
            >
              {loading ? "Consultant..." : "Consultar disponibilitat"}
            </button>
          </div>

          <div style={styles.paymentBox}>
            <label htmlFor="paymentMethod" style={styles.paymentLabel}>
              Mètode de pagament
            </label>

            <select
              id="paymentMethod"
              className="pb-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="online">Online</option>
              <option value="club">Club</option>
            </select>

            <p style={styles.paymentHelp}>
              Selecciona com vols registrar el pagament de la reserva.
            </p>
          </div>

          <div style={styles.filtersRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              />
              <span>Mostrar només franges disponibles</span>
            </label>
          </div>

          <div ref={topFeedbackRef} />

          {error && (
            <div className="scale-in" style={styles.feedbackSpacing}>
              <div className="pb-feedback pb-feedback--error">
                <p style={styles.feedbackTitleError}>Hi ha hagut un problema</p>
                <p style={styles.feedbackTextError}>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="scale-in" style={styles.feedbackSpacing}>
              <div
                className="pb-feedback pb-feedback--success"
                style={isMobileView ? styles.successBoxMobile : styles.successBox}
              >
                <div>
                  <p style={styles.feedbackTitleSuccess}>Reserva confirmada</p>
                  <p style={styles.feedbackTextSuccess}>{success}</p>
                </div>

                <div
                  style={{
                    ...styles.successActions,
                    ...(isMobileView ? styles.successActionsMobile : {}),
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate("/my-reservations")}
                    className="btn btn-success btn-sm"
                    style={isMobileView ? styles.fullWidthButton : undefined}
                  >
                    Veure les meves reserves
                  </button>

                  <button
                    type="button"
                    onClick={() => setSuccess("")}
                    className="btn btn-outline-success btn-sm"
                    style={isMobileView ? styles.fullWidthButton : undefined}
                  >
                    Continuar aquí
                  </button>
                </div>
              </div>
            </div>
          )}

          {success && reservationSummary && (
            <section
              className="scale-in pb-surface-card"
              style={styles.successCard}
            >
              <div style={styles.successHeader}>
                <div>
                  <span style={styles.successEyebrow}>Reserva confirmada</span>
                  <h2 style={styles.successTitle}>
                    {reservationSummary.codi_reserva}
                  </h2>
                  <p style={styles.successSubtitle}>
                    La reserva s’ha registrat correctament i ja tens el resum complet.
                  </p>
                </div>

                <Link to="/my-reservations" className="btn btn-sm">
                  Veure les meves reserves
                </Link>
              </div>

              <div style={styles.successGrid}>
                <div style={styles.successInfoBox}>
                  <span style={styles.successLabel}>Pista</span>
                  <p style={styles.successValue}>{reservationSummary.nom_pista}</p>
                </div>

                <div style={styles.successInfoBox}>
                  <span style={styles.successLabel}>Data</span>
                  <p style={styles.successValue}>
                    {reservationSummary.data_reserva}
                  </p>
                </div>

                <div style={styles.successInfoBox}>
                  <span style={styles.successLabel}>Hora</span>
                  <p style={styles.successValue}>
                    {reservationSummary.hora_inici} - {reservationSummary.hora_fi}
                  </p>
                </div>

                <div style={styles.successInfoBox}>
                  <span style={styles.successLabel}>Preu</span>
                  <p style={styles.successValue}>
                    {reservationSummary.preu_total != null
                      ? `${Number(reservationSummary.preu_total).toFixed(2)} €`
                      : "No disponible"}
                  </p>
                </div>

                <div style={styles.successInfoBox}>
                  <span style={styles.successLabel}>Pagament</span>
                  <p style={styles.successValue}>
                    {reservationSummary.metode_pagament}
                  </p>
                </div>

                <div style={styles.successInfoBox}>
                  <span style={styles.successLabel}>Estat pagament</span>
                  <p style={styles.successValue}>
                    {reservationSummary.estat_pagament}
                  </p>
                </div>
              </div>
            </section>
          )}

          {showAuthHelp && (
            <div className="scale-in" style={styles.feedbackSpacing}>
              <div
                className="pb-feedback pb-feedback--info"
                style={isMobileView ? styles.authHelpBoxMobile : styles.authHelpBox}
              >
                <div>
                  <p style={styles.authHelpTitle}>
                    Necessites iniciar sessió per reservar
                  </p>
                  <p style={styles.authHelpText}>
                    Si ja tens compte, entra ara. Si encara no, pots registrar-te
                    en molt poc temps.
                  </p>
                </div>

                <div
                  style={{
                    ...styles.authHelpActions,
                    ...(isMobileView ? styles.authHelpActionsMobile : {}),
                  }}
                >
                  <Link
                    to="/login"
                    className="btn btn-primary btn-sm"
                    style={isMobileView ? styles.fullWidthButton : undefined}
                  >
                    Iniciar sessió
                  </Link>

                  <Link
                    to="/register"
                    className="btn btn-light btn-sm"
                    style={isMobileView ? styles.fullWidthButton : undefined}
                  >
                    Crear compte
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {loading && (
          <LoadingSpinner
            text="Consultant la disponibilitat de pistes..."
            minHeight="220px"
          />
        )}

        {!loading && filteredAvailability.length > 0 && (
          <>
            <AvailabilitySummary availability={filteredAvailability} />

            <section
              ref={resultsRef}
              className="fade-in-up delay-2"
              style={styles.resultsSection}
            >
              <div
                style={{
                  ...styles.resultsHeader,
                  ...(isMobileView ? styles.resultsHeaderMobile : {}),
                }}
              >
                <div>
                  <span className="pb-kicker">Resultats</span>
                  <h2 className="pb-panel-title">Disponibilitat del dia</h2>
                  <p className="pb-panel-text">
                    Aquí tens la vista detallada de totes les franges segons els
                    filtres actuals.
                  </p>
                </div>

                <div style={styles.stats}>
                  <span className="pb-badge-pill pb-badge-pill--blue">
                    {uniqueCourts.length} pistes
                  </span>
                  <span className="pb-badge-pill pb-badge-pill--blue">
                    {filteredAvailability.length} franges
                  </span>
                  <span className="pb-badge-pill pb-badge-pill--green">
                    {availableCount} lliures
                  </span>
                  <span className="pb-badge-pill pb-badge-pill--rose">
                    {occupiedCount} ocupades
                  </span>
                </div>
              </div>

              <AvailabilityTable
                availability={filteredAvailability}
                onReserve={handleReserve}
                reservingSlot={reservingSlot}
                recentlyReservedSlot={recentlyReservedSlot}
                selectedDate={date}
              />
            </section>
          </>
        )}

        {!loading && filteredAvailability.length === 0 && !error && (
          <section className="scale-in pb-surface-card" style={styles.emptyState}>
            <span style={styles.emptyIcon}>🎾</span>
            <h3 style={styles.emptyTitle}>No hi ha disponibilitat per aquest dia</h3>
            <p style={styles.emptyText}>
              Prova una altra data o desactiva el filtre de franges disponibles
              per veure totes les franges del sistema.
            </p>
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
    position: "relative",
    overflow: "hidden",
    borderRadius: "30px",
    padding: "2rem",
    boxShadow: "0 26px 56px rgba(37,99,235,0.16)",
    color: "white",
    marginBottom: "1.5rem",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(37,99,235,0.88))",
  },
  heroMobile: {
    padding: "1.25rem",
    borderRadius: "24px",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: "1.4rem",
    alignItems: "center",
  },
  heroGridMobile: {
    gridTemplateColumns: "1fr",
  },
  title: {
    margin: "1rem 0 0 0",
    fontSize: "3rem",
    lineHeight: 1.03,
    maxWidth: "760px",
  },
  titleMobile: {
    fontSize: "2.2rem",
  },
  subtitle: {
    marginTop: "0.95rem",
    marginBottom: 0,
    fontSize: "1.05rem",
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.84)",
    maxWidth: "760px",
  },
  heroDateCard: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "24px",
    padding: "1.2rem",
    backdropFilter: "blur(10px)",
    boxShadow: "0 14px 30px rgba(15,23,42,0.08)",
  },
  heroDateLabel: {
    display: "block",
    fontSize: "0.82rem",
    fontWeight: "800",
    opacity: 0.82,
    marginBottom: "0.45rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  heroDateValue: {
    display: "block",
    fontSize: "1.2rem",
    lineHeight: 1.5,
    textTransform: "capitalize",
  },
  heroDateMeta: {
    display: "flex",
    gap: "0.55rem",
    flexWrap: "wrap",
    marginTop: "1rem",
  },
  searchCard: {
    padding: "1.5rem",
  },
  searchCardMobile: {
    padding: "1rem",
    borderRadius: "22px",
  },
  searchHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1.1rem",
  },
  searchHeaderMobile: {
    flexDirection: "column",
  },
  selectionHint: {
    background: "#f8fbff",
    border: "1px solid #dbeafe",
    borderRadius: "18px",
    padding: "0.9rem 1rem",
    minWidth: "220px",
    display: "flex",
    flexDirection: "column",
    gap: "0.22rem",
  },
  selectionHintLabel: {
    fontSize: "0.8rem",
    fontWeight: "800",
    color: "#64748b",
  },
  selectionHintValue: {
    fontWeight: "800",
    color: "#1d4ed8",
  },
  quickDaysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))",
    gap: "0.8rem",
    marginBottom: "1rem",
  },
  quickDaysGridMobile: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  quickDayButton: {
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.88)",
    borderRadius: "20px",
    padding: "1rem 0.7rem",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.28rem",
    transition: "all 0.22s ease",
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
  },
  quickDayActive: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    border: "1px solid #2563eb",
    boxShadow: "0 18px 34px rgba(37,99,235,0.22)",
    transform: "translateY(-1px)",
  },
  quickDayWeekday: {
    fontSize: "0.9rem",
    fontWeight: "800",
    textTransform: "capitalize",
  },
  quickDayNumber: {
    fontSize: "1.45rem",
    fontWeight: "800",
    lineHeight: 1,
  },
  quickDayLabel: {
    fontSize: "0.76rem",
    minHeight: "1rem",
    opacity: 0.9,
  },
  controls: {
    display: "flex",
    gap: "0.8rem",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  controlsMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  datePickerWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    position: "relative",
  },
  datePickerWrapperMobile: {
    width: "100%",
  },
  dateInputLabel: {
    fontSize: "0.8rem",
    fontWeight: "800",
    color: "#64748b",
  },
  customDateButton: {
    minWidth: "240px",
    padding: "0.98rem 1rem",
    fontSize: "1rem",
    border: "1px solid rgba(148,163,184,0.24)",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.96)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
  },
  customDateButtonMobile: {
    width: "100%",
    minWidth: "unset",
    boxSizing: "border-box",
  },
  customDateText: {
    fontWeight: "800",
    color: "#0f172a",
  },
  calendarIcon: {
    fontSize: "1.1rem",
  },
  hiddenDateInput: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
    width: 0,
    height: 0,
  },
  fullWidthButton: {
    width: "100%",
  },
  paymentBox: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  paymentLabel: {
    fontSize: "0.9rem",
    fontWeight: "800",
    color: "#334155",
  },
  paymentHelp: {
    margin: 0,
    fontSize: "0.88rem",
    color: "#64748b",
    lineHeight: 1.6,
  },
  filtersRow: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(148,163,184,0.14)",
  },
  checkboxLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.6rem",
    fontWeight: "700",
    color: "#334155",
    flexWrap: "wrap",
  },
  feedbackSpacing: {
    marginTop: "1rem",
  },
  feedbackTitleError: {
    margin: 0,
    color: "#be123c",
    fontWeight: "800",
  },
  feedbackTextError: {
    marginTop: "0.35rem",
    marginBottom: 0,
    color: "#9f1239",
    lineHeight: 1.6,
    fontWeight: "600",
  },
  successBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  successBoxMobile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "1rem",
  },
  feedbackTitleSuccess: {
    margin: 0,
    color: "#166534",
    fontWeight: "800",
    fontSize: "1rem",
  },
  feedbackTextSuccess: {
    margin: "0.35rem 0 0 0",
    color: "#166534",
    lineHeight: 1.6,
    fontWeight: "600",
  },
  successActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  successActionsMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  successCard: {
    marginTop: "1rem",
    padding: "1.25rem",
    borderRadius: "24px",
  },
  successHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  successEyebrow: {
    display: "inline-block",
    marginBottom: "0.4rem",
    fontSize: "0.78rem",
    color: "#15803d",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  successTitle: {
    margin: 0,
    fontSize: "1.6rem",
    color: "#0f172a",
  },
  successSubtitle: {
    marginTop: "0.35rem",
    marginBottom: 0,
    color: "#64748b",
    lineHeight: 1.65,
  },
  successGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.85rem",
  },
  successInfoBox: {
    background: "rgba(248,250,252,0.95)",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "0.95rem 1rem",
  },
  successLabel: {
    display: "block",
    marginBottom: "0.35rem",
    color: "#64748b",
    fontSize: "0.82rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  successValue: {
    margin: 0,
    color: "#0f172a",
    fontWeight: "700",
    lineHeight: 1.55,
  },
  authHelpBox: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  authHelpBoxMobile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "1rem",
  },
  authHelpTitle: {
    margin: 0,
    color: "#1e40af",
    fontWeight: "800",
  },
  authHelpText: {
    marginTop: "0.35rem",
    marginBottom: 0,
    color: "#334155",
    lineHeight: 1.6,
  },
  authHelpActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  authHelpActionsMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  resultsSection: {
    marginTop: "2rem",
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  resultsHeaderMobile: {
    alignItems: "stretch",
  },
  stats: {
    display: "flex",
    gap: "0.6rem",
    flexWrap: "wrap",
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
};

export default AvailabilityPage;