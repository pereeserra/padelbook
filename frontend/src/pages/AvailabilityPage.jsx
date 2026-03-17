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

  // Detectar canvis de mida per adaptar la vista a dispositius mòbils
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

  // Funció per obtenir la disponibilitat de pistes per a una data determinada
  const fetchAvailability = async (selectedDate) => {
    try {
      if (!selectedDate) {
        setError("Has de seleccionar una data");
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
      setError("Error obtenint la disponibilitat");
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

  // Funció per gestionar la reserva d'una franja horària
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
      });

      setSuccess(
        response?.data?.message ||
          `Reserva confirmada a ${slot.nom_pista} (${slot.hora_inici} - ${slot.hora_fi}).`
      );

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
        setError("Error creant la reserva");
      }

      setSuccess("");
      setReservingSlot(null);
    }
  };

  // Carregar la disponibilitat inicialment i cada vegada que canviï la data seleccionada
  useEffect(() => {
    fetchAvailability(date);
  }, [date]);

  // Scroll a Disponibilitat del dia
  useEffect(() => {
    if (success) return;
    if (!shouldScrollToResultsRef.current) return;

    if (!loading && availability.length > 0 && resultsRef.current) {
      scrollToElementWithOffset(resultsRef.current, 160);
      shouldScrollToResultsRef.current = false;
    }
  }, [availability, loading, success]);

  // Scroll a Reserva confirmada o error
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
          <span style={styles.badge}>Reserva la teva pista</span>
          <h1
            style={{
              ...styles.title,
              ...(isMobileView ? styles.titleMobile : {}),
            }}
          >
            Disponibilitat
          </h1>
          <p style={styles.subtitle}>
            Selecciona un dia, consulta les pistes disponibles i fes la teva
            reserva de manera ràpida i clara.
          </p>
        </section>

        <section
          className="fade-in-up delay-1"
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
              <h2 style={styles.searchTitle}>Selecciona una data</h2>
              <p style={styles.searchText}>
                Canvia de dia i la disponibilitat s’actualitzarà automàticament.
              </p>
            </div>

            <div
              style={{
                ...styles.selectedDateBox,
                ...(isMobileView ? styles.selectedDateBoxMobile : {}),
              }}
            >
              <span style={styles.selectedDateLabel}>Data seleccionada</span>
              <span style={styles.selectedDateValue}>
                {formatDisplayDate(date)}
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
                  {day.isToday ? "Avui" : ""}
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
              className={`btn btn-secondary ${previousDayDisabled ? "is-disabled" : ""}`}
              style={
                isMobileView
                  ? styles.fullWidthButton
                  : styles.secondaryButton
              }
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
              style={
                isMobileView
                  ? styles.fullWidthButton
                  : styles.secondaryButton
              }
            >
              Dia següent →
            </button>

            <button
              onClick={handleSetToday}
              className="btn btn-light"
              style={isMobileView ? styles.fullWidthButton : styles.lightButton}
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
              style={
                isMobileView
                  ? styles.fullWidthButton
                  : styles.primaryButton
              }
            >
              {loading ? "Consultant..." : "Consultar disponibilitat"}
            </button>
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

          {error && <p style={styles.error}>{error}</p>}

          {success && (
            <div
              style={{
                ...styles.successBox,
                ...(isMobileView ? styles.successBoxMobile : {}),
              }}
            >
              <div>
                <p style={styles.successTitle}>Reserva confirmada</p>
                <p style={styles.successText}>{success}</p>
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
                  style={
                    isMobileView
                      ? styles.fullWidthButton
                      : styles.successPrimaryButton
                  }
                >
                  Veure les meves reserves
                </button>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  className="btn btn-outline-success btn-sm"
                  style={
                    isMobileView
                      ? styles.fullWidthButton
                      : styles.successSecondaryButton
                  }
                >
                  Continuar aquí
                </button>
              </div>
            </div>
          )}

          {showAuthHelp && (
            <div style={styles.authHelpBox}>
              <div style={styles.authHelpTop}>
                <div>
                  <p style={styles.authHelpTitle}>
                    Necessites un compte per reservar
                  </p>
                  <p style={styles.authHelpText}>
                    Si ja tens compte, inicia sessió. Si encara no, registra’t en
                    menys d’un minut.
                  </p>
                </div>
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
                  style={
                    isMobileView
                      ? styles.fullWidthButton
                      : styles.authHelpPrimary
                  }
                >
                  Iniciar sessió
                </Link>
                <Link
                  to="/register"
                  className="btn btn-light btn-sm"
                  style={
                    isMobileView
                      ? styles.fullWidthButton
                      : styles.authHelpSecondary
                  }
                >
                  Crear compte
                </Link>
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
                <h2 style={styles.resultsTitle}>Disponibilitat del dia</h2>

                <div style={styles.stats}>
                  <span style={styles.countBadge}>
                    {uniqueCourts.length} pistes
                  </span>
                  <span style={styles.countBadge}>
                    {filteredAvailability.length} franges
                  </span>
                  <span style={styles.countBadge}>
                    {availableCount} disponibles
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
          <section style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No hi ha disponibilitat per aquest dia</h3>
            <p style={styles.emptyText}>
              Prova un altre dia o desactiva el filtre de franges disponibles si
              vols veure totes les franges del sistema.
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
    background: "linear-gradient(135deg, #1e40af, #2563eb)",
    color: "white",
    padding: "2rem",
    borderRadius: "18px",
    marginBottom: "1.75rem",
    boxShadow: "0 10px 24px rgba(37,99,235,0.22)",
  },
  heroMobile: {
    padding: "1.35rem",
    borderRadius: "16px",
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
  titleMobile: {
    fontSize: "2rem",
  },
  subtitle: {
    marginTop: "0.75rem",
    marginBottom: 0,
    fontSize: "1.05rem",
    lineHeight: 1.7,
    opacity: 0.96,
    maxWidth: "760px",
  },
  searchCard: {
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "1.5rem",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  searchCardMobile: {
    padding: "1rem",
  },
  searchHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  searchHeaderMobile: {
    flexDirection: "column",
  },
  searchTitle: {
    margin: 0,
    fontSize: "1.6rem",
  },
  searchText: {
    marginTop: "0.4rem",
    marginBottom: 0,
    color: "#4b5563",
  },
  selectedDateBox: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    padding: "0.8rem 1rem",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    minWidth: "260px",
  },
  selectedDateBoxMobile: {
    width: "100%",
    minWidth: "unset",
    boxSizing: "border-box",
  },
  selectedDateLabel: {
    fontSize: "0.8rem",
    fontWeight: "700",
    opacity: 0.75,
  },
  selectedDateValue: {
    fontWeight: "800",
    textTransform: "capitalize",
  },
  quickDaysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  quickDaysGridMobile: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  quickDayButton: {
    border: "1px solid #dbeafe",
    backgroundColor: "#f8fbff",
    borderRadius: "14px",
    padding: "0.9rem 0.6rem",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.25rem",
    transition: "0.2s",
  },
  quickDayActive: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "1px solid #2563eb",
    boxShadow: "0 8px 16px rgba(37,99,235,0.22)",
  },
  quickDayWeekday: {
    fontSize: "0.9rem",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  quickDayNumber: {
    fontSize: "1.4rem",
    fontWeight: "800",
    lineHeight: 1,
  },
  quickDayLabel: {
    fontSize: "0.8rem",
    minHeight: "1rem",
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
    fontWeight: "700",
    color: "#64748b",
  },
  customDateButton: {
    minWidth: "230px",
    padding: "0.9rem 1rem",
    fontSize: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  customDateButtonMobile: {
    width: "100%",
    minWidth: "unset",
    boxSizing: "border-box",
  },
  customDateText: {
    fontWeight: "700",
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
  primaryButton: {
    minWidth: "140px",
  },
  secondaryButton: {},
  lightButton: {},
  fullWidthButton: {
    width: "100%",
  },
  filtersRow: {
    marginTop: "1rem",
  },
  checkboxLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.6rem",
    fontWeight: "600",
    color: "#334155",
  },
  error: {
    color: "#b91c1c",
    fontWeight: "700",
    marginTop: "1rem",
    backgroundColor: "#fee2e2",
    padding: "0.8rem 1rem",
    borderRadius: "10px",
  },
  successBox: {
    marginTop: "1rem",
    backgroundColor: "#ecfdf5",
    border: "1px solid #86efac",
    padding: "1rem",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  successBoxMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  successTitle: {
    margin: 0,
    color: "#166534",
    fontWeight: "800",
    fontSize: "1rem",
  },
  successText: {
    margin: "0.35rem 0 0 0",
    color: "#166534",
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
  successPrimaryButton: {},
  successSecondaryButton: {},
  authHelpBox: {
    marginTop: "1rem",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "14px",
    padding: "1rem",
  },
  authHelpTop: {
    marginBottom: "0.8rem",
  },
  authHelpTitle: {
    margin: 0,
    color: "#1e3a8a",
    fontWeight: "800",
  },
  authHelpText: {
    margin: "0.35rem 0 0 0",
    color: "#334155",
    lineHeight: 1.6,
  },
  authHelpActions: {
    display: "flex",
    gap: "0.8rem",
    flexWrap: "wrap",
  },
  authHelpActionsMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  authHelpPrimary: {},
  authHelpSecondary: {},
  resultsSection: {
    marginTop: "2rem",
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  resultsHeaderMobile: {
    alignItems: "stretch",
  },
  resultsTitle: {
    margin: 0,
    fontSize: "1.8rem",
  },
  stats: {
    display: "flex",
    gap: "0.6rem",
    flexWrap: "wrap",
  },
  countBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.95rem",
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
  emptyTitle: {
    marginTop: 0,
    marginBottom: "0.75rem",
    fontSize: "1.5rem",
  },
  emptyText: {
    margin: 0,
    color: "#4b5563",
    lineHeight: 1.7,
  },
};

export default AvailabilityPage;