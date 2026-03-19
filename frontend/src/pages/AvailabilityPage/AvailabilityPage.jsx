import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import AvailabilityTable from "../../components/AvailabilityTable/AvailabilityTable";
import AvailabilitySummary from "../../components/AvailabilitySummary/AvailabilitySummary";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import "./AvailabilityPage.css";

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
  const [paymentMethod, setPaymentMethod] = useState("online_simulat");
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
    <div className="avail-page__page">
      <div
        className={`avail-page__container ${isMobileView ? "avail-page__container--mobile" : ""}`}
      >
        <section
          className={`fade-in-up avail-page__hero ${isMobileView ? "avail-page__hero--mobile" : ""}`}
        >
          <div
            className={`avail-page__hero-grid ${isMobileView ? "avail-page__hero-grid--mobile" : ""}`}
          >
            <div>
              <span className="pb-chip">Reserva la teva pista</span>
              <h1
                className={`avail-page__title ${isMobileView ? "avail-page__title--mobile" : ""}`}
              >
                Consulta la disponibilitat d’una manera més clara i visual
              </h1>
              <p className="avail-page__subtitle">
                Selecciona un dia, revisa ràpidament quines pistes i franges
                tens disponibles i confirma la teva reserva amb una experiència
                més neta i agradable.
              </p>
            </div>

            <div className="avail-page__hero-date-card">
              <span className="avail-page__hero-date-label">Data seleccionada</span>
              <strong className="avail-page__hero-date-value">
                {formatDisplayDate(date)}
              </strong>

              <div className="avail-page__hero-date-meta">
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
          className={`fade-in-up delay-1 pb-surface-card avail-page__search-card ${isMobileView ? "avail-page__search-card--mobile" : ""}`}
        >
          <div
            className={`avail-page__search-header ${isMobileView ? "avail-page__search-header--mobile" : ""}`}
          >
            <div>
              <span className="pb-kicker">Selecció de dia</span>
              <h2 className="pb-panel-title">Tria el dia que vols jugar</h2>
              <p className="pb-panel-text">
                Pots usar els dies ràpids, canviar un dia enrere o endavant, o
                obrir el selector manual.
              </p>
            </div>

            <div className="avail-page__selection-hint">
              <span className="avail-page__selection-hint-label">Vista actual</span>
              <span className="avail-page__selection-hint-value">
                Disponibilitat del dia
              </span>
            </div>
          </div>

          <div
            className={`avail-page__quick-days-grid ${isMobileView ? "avail-page__quick-days-grid--mobile" : ""}`}
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
                className={`avail-page__quick-day-button ${date === day.iso ? "avail-page__quick-day-button--active" : ""}`}
              >
                <span className="avail-page__quick-day-weekday">{day.weekday}</span>
                <span className="avail-page__quick-day-number">{day.dayNumber}</span>
                <span className="avail-page__quick-day-label">
                  {day.isToday ? "Avui" : "Disponible"}
                </span>
              </button>
            ))}
          </div>

          <div
            className={`avail-page__controls ${isMobileView ? "avail-page__controls--mobile" : ""}`}
          >
            <button
              onClick={() => changeDay(-1)}
              className={`btn btn-secondary ${
                previousDayDisabled ? "is-disabled" : ""
              }`}
              disabled={previousDayDisabled}
            >
              ← Dia anterior
            </button>

            <div
              className={`avail-page__date-picker-wrapper ${isMobileView ? "avail-page__date-picker-wrapper--mobile" : ""}`}
            >
              <span className="avail-page__date-input-label">Triar data manualment</span>

              <button
                type="button"
                onClick={handleOpenDatePicker}
                className={`avail-page__custom-date-button ${isMobileView ? "avail-page__custom-date-button--mobile" : ""}`}
              >
                <span className="avail-page__custom-date-text">
                  {new Date(date).toLocaleDateString("ca-ES")}
                </span>
                <span className="avail-page__calendar-icon">📅</span>
              </button>

              <input
                ref={hiddenDateInputRef}
                type="date"
                value={date}
                min={getToday()}
                onChange={(e) => handleManualDateChange(e.target.value)}
                className="avail-page__hidden-date-input"
              />
            </div>

            <button
              onClick={() => changeDay(1)}
              className="btn btn-secondary"
            >
              Dia següent →
            </button>

            <button
              onClick={handleSetToday}
              className="btn btn-light"
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
            >
              {loading ? "Consultant..." : "Consultar disponibilitat"}
            </button>
          </div>

          <div className="avail-page__payment-box">
            <label htmlFor="paymentMethod" className="avail-page__payment-label">
              Mètode de pagament
            </label>

            <select
              id="paymentMethod"
              className="pb-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="online_simulat">Online</option>
              <option value="al_club">Club</option>
            </select>

            <p className="avail-page__payment-help">
              Selecciona com vols registrar el pagament de la reserva.
            </p>
          </div>

          <div className="avail-page__filters-row">
            <label className="avail-page__checkbox-label">
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
            <div className="scale-in avail-page__feedback-spacing">
              <div className="pb-feedback pb-feedback--error">
                <p className="avail-page__feedback-title-error">Hi ha hagut un problema</p>
                <p className="avail-page__feedback-text-error">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="scale-in avail-page__feedback-spacing">
              <div
                className={`pb-feedback pb-feedback--success ${isMobileView ? "avail-page__success-box--mobile" : "avail-page__success-box"}`}
              >
                <div>
                  <p className="avail-page__feedback-title-success">Reserva confirmada</p>
                  <p className="avail-page__feedback-text-success">{success}</p>
                </div>

                <div
                  className={`avail-page__success-actions ${isMobileView ? "avail-page__success-actions--mobile" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => navigate("/my-reservations")}
                    className="btn btn-success btn-sm"
                  >
                    Veure les meves reserves
                  </button>

                  <button
                    type="button"
                    onClick={() => setSuccess("")}
                    className="btn btn-outline-success btn-sm"
                  >
                    Continuar aquí
                  </button>
                </div>
              </div>
            </div>
          )}

          {success && reservationSummary && (
            <section
              className="scale-in pb-surface-card avail-page__success-card"
            >
              <div className="avail-page__success-header">
                <div>
                  <span className="avail-page__success-eyebrow">Reserva confirmada</span>
                  <h2 className="avail-page__success-title">
                    {reservationSummary.codi_reserva}
                  </h2>
                  <p className="avail-page__success-subtitle">
                    La reserva s’ha registrat correctament i ja tens el resum complet.
                  </p>
                </div>

                <Link to="/my-reservations" className="btn btn-sm">
                  Veure les meves reserves
                </Link>
              </div>

              <div className="avail-page__success-grid">
                <div className="avail-page__success-info-box">
                  <span className="avail-page__success-label">Pista</span>
                  <p className="avail-page__success-value">{reservationSummary.nom_pista}</p>
                </div>

                <div className="avail-page__success-info-box">
                  <span className="avail-page__success-label">Data</span>
                  <p className="avail-page__success-value">
                    {reservationSummary.data_reserva}
                  </p>
                </div>

                <div className="avail-page__success-info-box">
                  <span className="avail-page__success-label">Hora</span>
                  <p className="avail-page__success-value">
                    {reservationSummary.hora_inici} - {reservationSummary.hora_fi}
                  </p>
                </div>

                <div className="avail-page__success-info-box">
                  <span className="avail-page__success-label">Preu</span>
                  <p className="avail-page__success-value">
                    {reservationSummary.preu_total != null
                      ? `${Number(reservationSummary.preu_total).toFixed(2)} €`
                      : "No disponible"}
                  </p>
                </div>

                <div className="avail-page__success-info-box">
                  <span className="avail-page__success-label">Pagament</span>
                  <p className="avail-page__success-value">
                    {reservationSummary.metode_pagament}
                  </p>
                </div>

                <div className="avail-page__success-info-box">
                  <span className="avail-page__success-label">Estat pagament</span>
                  <p className="avail-page__success-value">
                    {reservationSummary.estat_pagament}
                  </p>
                </div>
              </div>
            </section>
          )}

          {showAuthHelp && (
            <div className="scale-in avail-page__feedback-spacing">
              <div
                className={`pb-feedback pb-feedback--info ${isMobileView ? "avail-page__auth-help-box--mobile" : "avail-page__auth-help-box"}`}
              >
                <div>
                  <p className="avail-page__auth-help-title">
                    Necessites iniciar sessió per reservar
                  </p>
                  <p className="avail-page__auth-help-text">
                    Si ja tens compte, entra ara. Si encara no, pots registrar-te
                    en molt poc temps.
                  </p>
                </div>

                <div
                  className={`avail-page__auth-help-actions ${isMobileView ? "avail-page__auth-help-actions--mobile" : ""}`}
                >
                  <Link
                    to="/login"
                    className="btn btn-primary btn-sm"
                  >
                    Iniciar sessió
                  </Link>

                  <Link
                    to="/register"
                    className="btn btn-light btn-sm"
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
              className="fade-in-up delay-2 avail-page__results-section"
            >
              <div
                className={`avail-page__results-header ${isMobileView ? "avail-page__results-header--mobile" : ""}`}
              >
                <div>
                  <span className="pb-kicker">Resultats</span>
                  <h2 className="pb-panel-title">Disponibilitat del dia</h2>
                  <p className="pb-panel-text">
                    Aquí tens la vista detallada de totes les franges segons els
                    filtres actuals.
                  </p>
                </div>

                <div className="avail-page__stats">
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
          <section className="scale-in pb-surface-card avail-page__empty-state">
            <span className="avail-page__empty-icon">🎾</span>
            <h3 className="avail-page__empty-title">No hi ha disponibilitat per aquest dia</h3>
            <p className="avail-page__empty-text">
              Prova una altra data o desactiva el filtre de franges disponibles
              per veure totes les franges del sistema.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

export default AvailabilityPage;