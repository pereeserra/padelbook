import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { scrollToElementWithOffset } from "../../utils/helpers";
import heroImg from "../../assets/images/padelballs.webp";
import "./AvailabilityPage.css";
import { getErrorMessage } from "../../utils/errorHandler";

function AvailabilityPage() {
  const hiddenDateInputRef = useRef(null);
  const topFeedbackRef = useRef(null);
  const repeatReservationHandledRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getToday());
  const [availability, setAvailability] = useState([]);
  const [availabilitySummary, setAvailabilitySummary] = useState({
    total_courts: 0,
    total_slots: 0,
    total_available_slots: 0,
    total_unavailable_slots: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [courtTypeFilter, setCourtTypeFilter] = useState("tots");
  const [courtEnvironmentFilter, setCourtEnvironmentFilter] = useState("totes");
  const [showAuthHelp, setShowAuthHelp] = useState(false);
  const [showVerificationHelp, setShowVerificationHelp] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online_simulat");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservationSummary, setReservationSummary] = useState(null);
  const [reserving, setReserving] = useState(false);
  const [repeatReservationInfo, setRepeatReservationInfo] = useState(null);
  const [slotHelpMessage, setSlotHelpMessage] = useState("");

  // Funció per formatar el preu, mostrant "Preu no disponible" si no hi ha valor vàlid
  const formatPrice = (value) => {
    if (value == null || value === "") return "Preu no disponible";
    return `${Number(value).toFixed(2)} €`;
  };

  // Funció per formatar la data de visualització, mostrant "Cap data" si no hi ha valor vàlid
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Cap data";

    const dateObj = new Date(dateString);
    const formatted = dateObj.toLocaleDateString("ca-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Funció per obtenir el nom del dia de la setmana en format curt, amb la primera lletra en majúscula
  const formatShortWeekday = (dateObj) => {
    const formatted = dateObj.toLocaleDateString("ca-ES", { weekday: "short" });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Funció per formatar l'hora, mostrant només les hores i minuts (HH:MM)
  const formatTimeShort = (timeString) => {
    if (!timeString) return "";
    return timeString.slice(0, 5);
  };

  // Funció per formatar el tipus de pista, normalitzant les variants d'"individual" i mostrant "Dobles" per qualsevol altre valor
  const formatCourtType = (tipus) => {
    const normalized = String(tipus || "").trim().toLowerCase();

    if (normalized === "individual" || normalized === "individuals") {
      return "Individuals";
    }

    return "Dobles";
  };

  // Funció per formatar el tipus d'entorn de la pista, mostrant "Indoor" per coberta i "Outdoor" per descoberta
  const formatCourtEnvironment = (coberta) => {
    return Number(coberta) === 1 ? "Indoor" : "Outdoor";
  };

  const getSlotStatusLabel = (slot, isPastSlot) => {
    if (isPastSlot) return "Hora passada";
    if (slot.disponible) return "Disponible";
    if (slot.motiu_no_disponible === "manteniment") return "Manteniment";
    if (slot.motiu_no_disponible === "reserva") return "Reservada";
    return "No disponible";
  };

  const getSlotTitle = (slot, isPastSlot) => {
    if (isPastSlot) return "Hora passada";
    if (slot.disponible) return "Franja disponible";
    return slot.detall_no_disponible || "Franja no disponible";
  };

  // Funció per determinar si la data seleccionada és anterior a la data actual
  const isPastDate = (selectedDate) => {
    return selectedDate < getToday();
  };

  const isPastTimeSlot = (slot) => {
  const today = getToday();

  // Només aplicar si és avui
  if (date !== today) return false;

  const now = new Date();

  const [hours, minutes] = slot.hora_inici.split(":").map(Number);

  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);

  return slotTime <= now;
};

  // Funció per netejar missatges d'error i èxit, i restablir l'estat relacionat amb la reserva
  const clearMessages = () => {
    setError("");
    setSuccess("");
    setShowAuthHelp(false);
    setShowVerificationHelp(false);
    setReservationSummary(null);
    setSlotHelpMessage("");
  };

  // Funció per obrir el selector de data ocult, amb maneig de compatibilitat per diferents navegadors
  const handleOpenDatePicker = () => {
    const input = hiddenDateInputRef.current;
    if (!input) return;

    try {
      input.focus();

      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }

      input.click();
    } catch {
      input.focus();
      input.click();
    }
  };

  // Funció per obtenir la disponibilitat de pistes per a la data seleccionada, amb validació i maneig d'errors
  const fetchAvailability = async (selectedDate) => {
    try {
      if (!selectedDate) {
        setError("Has de seleccionar una data.");
        setAvailability([]);
        setAvailabilitySummary({
          total_courts: 0,
          total_slots: 0,
          total_available_slots: 0,
          total_unavailable_slots: 0,
        });
        return;
      }

      if (isPastDate(selectedDate)) {
        setError("No pots consultar disponibilitat en dates passades.");
        setAvailability([]);
        setAvailabilitySummary({
          total_courts: 0,
          total_slots: 0,
          total_available_slots: 0,
          total_unavailable_slots: 0,
        });
        return;
      }

      setLoading(true);
      setError("");
      setShowAuthHelp(false);
      setSelectedSlot(null);

      const response = await api.get(`/availability?date=${selectedDate}`);
      const availabilityData = response?.data?.data || {};

      const courts = Array.isArray(availabilityData?.courts)
        ? availabilityData.courts
        : [];

      const flatSlots = courts.flatMap((court) =>
        Array.isArray(court.slots) ? court.slots : []
      );

      setAvailability(flatSlots);

      setAvailabilitySummary(
        availabilityData?.summary || {
          total_courts: 0,
          total_slots: 0,
          total_available_slots: 0,
          total_unavailable_slots: 0,
        }
      );
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "No s'ha pogut carregar la disponibilitat."));
      setAvailability([]);
      setAvailabilitySummary({
        total_courts: 0,
        total_slots: 0,
        total_available_slots: 0,
        total_unavailable_slots: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Funció per manejar el canvi de data manualment, amb validació per dates passades i actualització de l'estat
  const handleManualDateChange = (newDate) => {
    if (!newDate) return;

    if (isPastDate(newDate)) {
      setError("No pots seleccionar una data anterior a avui.");
      return;
    }

    clearMessages();
    setDate(newDate);
  };

  // Funció per manejar la reserva d'una pista, amb validació d'autenticació, maneig d'errors i actualització de l'estat de la reserva
  const handleReserve = async () => {
    if (!selectedSlot) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Per reservar una pista, has d'iniciar sessió.");
        setShowAuthHelp(true);
        setShowVerificationHelp(false);
        return;
      }

      clearMessages();
      setReserving(true);

      const response = await api.post("/reservations", {
        court_id: selectedSlot.court_id,
        time_slot_id: selectedSlot.time_slot_id,
        data_reserva: date,
        duration: 1,
        metode_pagament: paymentMethod,
      });

      const reservationData = response?.data?.data || null;

      setSuccess(
        `Reserva confirmada a ${selectedSlot.nom_pista} (${formatTimeShort(
          selectedSlot.hora_inici
        )} - ${formatTimeShort(selectedSlot.hora_fi)}) · Duració: 1h.`
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
        nom_pista: selectedSlot.nom_pista,
        hora_inici: selectedSlot.hora_inici,
        hora_fi: selectedSlot.hora_fi,
        duration: 1,
        data_reserva: date,
      });

      setSelectedSlot(null);
      fetchAvailability(date);
      scrollToElementWithOffset(topFeedbackRef.current, 120);
    } catch (err) {
      console.error(err);

      const errorMessage = getErrorMessage(
        err,
        "No s'ha pogut crear la reserva."
      );

      if (errorMessage.toLowerCase().includes("verificar el teu correu")) {
        setError("Has de verificar el teu correu abans de reservar.");
        setShowAuthHelp(false);
        setShowVerificationHelp(true);
      } else {
        setError(errorMessage);
        setShowVerificationHelp(false);
      }

      scrollToElementWithOffset(topFeedbackRef.current, 120);
    } finally {
      setReserving(false);
    }
  };

  useEffect(() => {
    const repeatReservation = location.state?.repeatReservation;

    if (!repeatReservation || repeatReservationHandledRef.current) return;

    repeatReservationHandledRef.current = true;
    setRepeatReservationInfo(repeatReservation);
    setDate(repeatReservation.data_reserva);

    if (repeatReservation.metode_pagament) {
      setPaymentMethod(repeatReservation.metode_pagament);
    }

    setShowOnlyAvailable(false);
    setCourtTypeFilter("tots");
    setCourtEnvironmentFilter("totes");
    clearMessages();
  }, [location.state]);

  // Efecte per obtenir la disponibilitat cada vegada que canvia la data seleccionada
  useEffect(() => {
    fetchAvailability(date);
  }, [date]);

  useEffect(() => {
    if (!repeatReservationInfo || loading || availability.length === 0) return;
    if (date !== repeatReservationInfo.data_reserva) return;

    const matchedSlot = availability.find((slot) => {
      return (
        slot.nom_pista === repeatReservationInfo.nom_pista &&
        slot.hora_inici === repeatReservationInfo.hora_inici &&
        slot.hora_fi === repeatReservationInfo.hora_fi
      );
    });

    if (matchedSlot && matchedSlot.disponible) {
      setSelectedSlot(matchedSlot);
      setSuccess("");
      setError("");
      scrollToElementWithOffset(topFeedbackRef.current, 120);
    } else {
      setSelectedSlot(null);
      setError(
        "La reserva anterior s'ha carregat, però aquesta franja ja no està disponible."
      );
      scrollToElementWithOffset(topFeedbackRef.current, 120);
    }

    setRepeatReservationInfo(null);
    navigate(location.pathname, { replace: true, state: {} });
  }, [repeatReservationInfo, availability, loading, date, navigate, location.pathname]);

  // Memorització de la disponibilitat filtrada segons l'estat de "Només disponibles"
  const filteredAvailability = useMemo(() => {
    return availability.filter((slot) => {
      const normalizedType = String(slot.tipus || "").trim().toLowerCase();
      const normalizedEnvironment =
        Number(slot.coberta) === 1 ? "indoor" : "outdoor";

      const matchesAvailability = true;

      const matchesCourtType =
        courtTypeFilter === "tots" ||
        normalizedType === courtTypeFilter;

      const matchesCourtEnvironment =
        courtEnvironmentFilter === "totes" ||
        normalizedEnvironment === courtEnvironmentFilter;

      return (
        matchesAvailability &&
        matchesCourtType &&
        matchesCourtEnvironment
      );
    });
  }, [availability, showOnlyAvailable, courtTypeFilter, courtEnvironmentFilter]);

  // Memorització dels propers 7 dies per a la selecció ràpida, amb formatació de la data i identificació del dia actual
  const quickDays = useMemo(() => {
    const start = new Date();
    start.setHours(12, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const current = new Date(start);
      current.setDate(start.getDate() + index);

      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");

      return {
        iso: `${year}-${month}-${day}`,
        dayNumber: current.getDate(),
        weekday: formatShortWeekday(current),
        isToday: index === 0,
      };
    });
  }, []);

  // Memorització de les pistes agrupades per nom, amb ordenació dels horaris i de les pistes
  const courtsData = useMemo(() => {
    const map = new Map();

    filteredAvailability.forEach((slot) => {
      if (!map.has(slot.nom_pista)) {
        map.set(slot.nom_pista, {
          nom_pista: slot.nom_pista,
          court_id: slot.court_id,
          slots: [],
        });
      }

      map.get(slot.nom_pista).slots.push(slot);
    });

    const courtsList = Array.from(map.values());

    courtsList.forEach((court) => {
      court.slots.sort((a, b) => a.hora_inici.localeCompare(b.hora_inici));
    });

    return courtsList.sort((a, b) => a.nom_pista.localeCompare(b.nom_pista));
  }, [filteredAvailability]);

  // Memorització de les estadístiques de disponibilitat, calculant el total de franges, franges disponibles, franges ocupades i total de pistes
  const availabilityStats = useMemo(() => {
    return {
      totalSlots: availabilitySummary.total_slots || 0,
      availableSlots: availabilitySummary.total_available_slots || 0,
      occupiedSlots: availabilitySummary.total_unavailable_slots || 0,
      totalCourts: availabilitySummary.total_courts || 0,
    };
  }, [availabilitySummary]);

  const isSlotValidForDuration = (slot) => {
    return slot.disponible;
  };

  const handleSlotClick = (slot, isSelected, isPastSlot) => {
    if (isPastSlot || !slot.disponible) {
      setSelectedSlot(null);
      setReservationSummary(null);
      setSlotHelpMessage(getSlotTitle(slot, isPastSlot));
      scrollToElementWithOffset(topFeedbackRef.current, 120);
      return;
    }

    setSlotHelpMessage("");
    setSelectedSlot(isSelected ? null : slot);
  };

  return (
    <div className="ap-wrapper">
      <header className="ap-hero">
        <div className="ap-hero__bg">
          <img src={heroImg} alt="Pista de pàdel" />
          <div className="ap-hero__overlay" />
        </div>

        <div className="ap-hero__inner">
          <span className="ap-hero__kicker">Disponibilitat en temps real</span>
          <h1 className="ap-title">Reserva de Pistes</h1>
          <p className="ap-subtitle">
            Selecciona el dia, explora les pistes disponibles i confirma la teva
            reserva d’una manera molt més clara i agradable.
          </p>
        </div>
      </header>

      <div className="ap-container">
        <section className="ap-dates-card fade-in-up">
          <div className="ap-dates-card__top">
            <div>
              <span className="ap-section-kicker">Selecciona el dia</span>
              <h2 className="ap-section-title">Tria la data que t’interessa</h2>
              <p className="ap-section-text">
                Pots reservar ràpidament des dels propers dies o obrir el calendari
                per escollir una altra data.
              </p>
            </div>

            <div className="ap-stats-chips">
              <span className="ap-stats-chip">
                {availabilityStats.totalCourts} pistes
              </span>
              <span className="ap-stats-chip ap-stats-chip--green">
                {availabilityStats.availableSlots} lliures
              </span>
              <span className="ap-stats-chip ap-stats-chip--red">
                {availabilityStats.occupiedSlots} ocupades
              </span>
            </div>
          </div>

          <div className="ap-dates-scroll">
            {quickDays.map((day) => (
              <button
                key={day.iso}
                onClick={() => handleManualDateChange(day.iso)}
                className={`ap-day-btn ${date === day.iso ? "is-active" : ""}`}
              >
                <span className="ap-day-name">{day.weekday}</span>
                <span className="ap-day-num">{day.dayNumber}</span>
                {day.isToday && <span className="ap-day-today">Avui</span>}
              </button>
            ))}

            <div className="ap-date-picker">
              <button
                type="button"
                onClick={handleOpenDatePicker}
                className="ap-day-btn ap-day-btn--cal"
              >
                <span className="ap-day-name">Més</span>
                <span className="ap-day-num">📅</span>
                <span className="ap-day-today">Calendari</span>
              </button>

              <input
                ref={hiddenDateInputRef}
                type="date"
                value={date}
                min={getToday()}
                onChange={(e) => handleManualDateChange(e.target.value)}
                className="ap-hidden-date"
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="ap-legend">
            <span className="ap-legend__item">
              <span className="ap-legend__dot ap-legend__dot--available"></span>
              Disponible
            </span>
            <span className="ap-legend__item">
              <span className="ap-legend__dot ap-legend__dot--reserved"></span>
              Reservada
            </span>
            <span className="ap-legend__item">
              <span className="ap-legend__dot ap-legend__dot--maintenance"></span>
              Manteniment
            </span>
            <span className="ap-legend__item">
              <span className="ap-legend__dot ap-legend__dot--past"></span>
              Hora passada
            </span>
          </div>

          <div className="ap-date-filters">
            <div className="ap-selected-date-block">
              <span className="ap-selected-date-label">Data seleccionada</span>
              <span className="ap-selected-date-text">{formatDisplayDate(date)}</span>
            </div>

            <div className="ap-filters-inline">
              <div className="ap-type-filter">
                <label htmlFor="courtTypeFilter" className="ap-type-filter__label">
                  Tipus de pista
                </label>

                <select
                  id="courtTypeFilter"
                  className="ap-type-filter__select"
                  value={courtTypeFilter}
                  onChange={(e) => setCourtTypeFilter(e.target.value)}
                >
                  <option value="tots">Totes</option>
                  <option value="dobles">Dobles</option>
                  <option value="individual">Individuals</option>
                </select>
              </div>

              <div className="ap-type-filter">
                <label
                  htmlFor="courtEnvironmentFilter"
                  className="ap-type-filter__label"
                >
                  Entorn
                </label>

                <select
                  id="courtEnvironmentFilter"
                  className="ap-type-filter__select"
                  value={courtEnvironmentFilter}
                  onChange={(e) => setCourtEnvironmentFilter(e.target.value)}
                >
                  <option value="totes">Totes</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              <label className="ap-filter-label">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                />
                Només disponibles
              </label>
            </div>
          </div>
        </section>

        <div ref={topFeedbackRef}></div>

        {error && (
          <div className="pb-feedback pb-feedback--error fade-in">
            <p className="pb-feedback__text">{error}</p>
          </div>
        )}

        {showAuthHelp && (
          <div className="pb-feedback pb-feedback--info fade-in">
            <p>Necessites iniciar sessió per reservar pistes.</p>
            <div className="ap-alert-actions">
              <Link to="/login" className="btn btn-primary btn-sm">
                Iniciar sessió
              </Link>
              <Link to="/register" className="btn btn-outline-primary btn-sm">
                Crear compte
              </Link>
            </div>
          </div>
        )}

        {showVerificationHelp && (
          <div className="pb-feedback pb-feedback--info fade-in">
            <p>
              El teu compte encara no té el correu verificat. Verifica'l o
              reenvia el correu des del teu perfil abans de reservar.
            </p>
            <div className="ap-alert-actions">
              <Link to="/my-account" className="btn btn-primary btn-sm">
                Anar al meu perfil
              </Link>
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                Tornar a login
              </Link>
            </div>
          </div>
        )}

        {slotHelpMessage && (
          <div className="ap-inline-help fade-in">
            <strong>Informació de la franja:</strong>
            <span>{slotHelpMessage}</span>
          </div>
        )}

        {success && reservationSummary && (
          <div className="pb-feedback pb-feedback--success fade-in fade-in-up">
            <div className="ap-success-header">
              <h3>🎉 Reserva Confirmada</h3>
              <span className="ap-success-code">{reservationSummary.codi_reserva}</span>
            </div>

            <div className="ap-success-details">
              <div>
                <span>Pista:</span>
                <strong>{reservationSummary.nom_pista}</strong>
              </div>
              <div>
                <span>Data:</span>
                <strong>{formatDisplayDate(reservationSummary.data_reserva)}</strong>
              </div>
              <div>
                <span>Hora:</span>
                <strong>
                  {formatTimeShort(reservationSummary.hora_inici)} -{" "}
                  {formatTimeShort(reservationSummary.hora_fi)}
                </strong>
              </div>
              <div>
                <span>Duració:</span>
                <strong>1h</strong>
              </div>
              <div>
                <span>Pagament:</span>
                <strong>
                  {reservationSummary.metode_pagament === "online_simulat"
                    ? "Pagament online"
                    : "Pagament al club"}
                </strong>
              </div>
            </div>

            <div className="ap-success-actions">
              <Link to="/my-reservations" className="btn btn-success">
                Veure les meves reserves
              </Link>
              <button onClick={clearMessages} className="btn btn-outline-success">
                Nova reserva
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="ap-loading">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="ap-courts-grid">
            {courtsData.length === 0 && !error && !success ? (
              <div className="ap-empty-state">
                <span>🎾</span>

                {availability.length > 0 && filteredAvailability.length === 0 ? (
                  <>
                    <p>No hi ha resultats amb els filtres seleccionats.</p>
                    <small>
                      Prova de llevar filtres o desactivar “Només disponibles”.
                    </small>
                  </>
                ) : availability.length > 0 && availabilityStats.occupiedSlots > 0 ? (
                  <>
                    <p>No hi ha cap franja reservable per aquest dia.</p>
                    <small>
                      Totes les franges estan ocupades o bloquejades.
                    </small>
                  </>
                ) : (
                  <>
                    <p>No hi ha dades de disponibilitat per aquest dia.</p>
                    <small>
                      Prova una altra data o torna-ho a intentar més tard.
                    </small>
                  </>
                )}
              </div>
            ) : (
              courtsData.map((court, courtIndex) => {
                const availableCount = court.slots.filter((s) => s.disponible).length;
                const reservedCount = court.slots.filter(
                  (s) => !s.disponible && s.motiu_no_disponible === "reserva"
                ).length;
                const maintenanceCount = court.slots.filter(
                  (s) => !s.disponible && s.motiu_no_disponible === "manteniment"
                ).length;

                return (
                  <div
                    key={court.court_id}
                    className={`ap-court-card fade-in-up ap-delay-${(courtIndex % 3) + 1}`}
                  >
                    <div className="ap-court-header">
                      <div>
                        <span className="ap-court-eyebrow">Pista</span>
                        <h3 className="ap-court-name">{court.nom_pista}</h3>
                      </div>

                      <div className="ap-court-badges">
                        <span className="ap-court-meta">{availableCount} lliures</span>

                        <span className="ap-court-meta ap-court-meta--soft">
                          {reservedCount} reservades
                        </span>

                        <span className="ap-court-meta ap-court-meta--maintenance">
                          {maintenanceCount} manteniment
                        </span>

                        <span
                          className={`ap-court-meta ${
                            formatCourtType(court.slots[0]?.tipus) === "Individuals"
                              ? "ap-court-meta--individual"
                              : "ap-court-meta--dobles"
                          }`}
                        >
                          {formatCourtType(court.slots[0]?.tipus)}
                        </span>

                        <span
                          className={`ap-court-meta ${
                            formatCourtEnvironment(court.slots[0]?.coberta) === "Indoor"
                              ? "ap-court-meta--indoor"
                              : "ap-court-meta--outdoor"
                          }`}
                        >
                          {formatCourtEnvironment(court.slots[0]?.coberta)}
                        </span>
                      </div>
                    </div>

                    <div className="ap-slots-grid">
                      {court.slots.map((slot) => {
                        const isSelected =
                          selectedSlot?.time_slot_id === slot.time_slot_id &&
                          selectedSlot?.court_id === slot.court_id;

                        const isPastSlot = isPastTimeSlot(slot);
                        const isValid = isSlotValidForDuration(slot);

                        const shouldHideSlot =
                          showOnlyAvailable &&
                          (!isValid || isPastSlot);

                        return (
                          <div
                            key={slot.time_slot_id}
                            className={`ap-slot-item ${
                              shouldHideSlot ? "is-hidden" : ""
                            }`}
                          >
                            <button
                              onClick={() =>
                                handleSlotClick(slot, isSelected, isPastSlot)
                              }
                              title={getSlotTitle(slot, isPastSlot)}
                              className={`ap-slot-pill ${
                                isPastSlot
                                  ? "is-past"
                                  : slot.disponible
                                  ? isSelected
                                    ? "is-selected"
                                    : "is-available"
                                  : slot.motiu_no_disponible === "manteniment"
                                  ? "is-maintenance"
                                  : "is-booked"
                              }`}
                            >
                              <span className="ap-slot-time">
                                {formatTimeShort(slot.hora_inici)}
                              </span>
                              <span className="ap-slot-status">
                                {getSlotStatusLabel(slot, isPastSlot)}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedSlot && !success && (
        <div className="ap-floating-action slide-up">
          <div className="ap-floating-inner">
            <button
              type="button"
              className="ap-floating-close"
              onClick={() => {
                setSelectedSlot(null);
                setReservationSummary(null);
              }}
              aria-label="Tancar selecció"
            >
              ×
            </button>
            <div className="ap-floating-info">
              <span className="ap-floating-court">{selectedSlot.nom_pista}</span>

              <strong className="ap-floating-time">
                {formatDisplayDate(date)} • {formatTimeShort(selectedSlot.hora_inici)} a{" "}
                {formatTimeShort(selectedSlot.hora_fi)}
              </strong>

              <span className="ap-floating-price">
                {formatPrice(selectedSlot.preu_reserva)}
              </span>
            </div>

            <div className="ap-floating-controls">
              <div className="ap-payment-field">
                <span className="ap-payment-label">Mètode de pagament</span>

                <div className="ap-payment-toggle">
                  <button
                    type="button"
                    className={`ap-payment-option ${
                      paymentMethod === "online_simulat" ? "is-active" : ""
                    }`}
                    onClick={() => setPaymentMethod("online_simulat")}
                  >
                    Pagament online
                  </button>

                  <button
                    type="button"
                    className={`ap-payment-option ${
                      paymentMethod === "al_club" ? "is-active" : ""
                    }`}
                    onClick={() => setPaymentMethod("al_club")}
                  >
                    Pagament al club
                  </button>
                </div>
              </div>

              <button
                onClick={handleReserve}
                disabled={reserving}
                className="btn btn-primary ap-reserve-btn"
              >
                {reserving ? "Reservant..." : "Confirmar Reserva"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSlot && !success && <div className="ap-bottom-spacing"></div>}
    </div>
  );
}

export default AvailabilityPage;