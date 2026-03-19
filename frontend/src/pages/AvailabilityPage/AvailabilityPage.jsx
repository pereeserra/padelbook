import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { scrollToElementWithOffset } from "../../utils/helpers";
import "./AvailabilityPage.css";

function AvailabilityPage() {
  const navigate = useNavigate();
  const hiddenDateInputRef = useRef(null);
  const topFeedbackRef = useRef(null);

  const getToday = () => new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(getToday());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [showAuthHelp, setShowAuthHelp] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online_simulat");
  const [reservationSummary, setReservationSummary] = useState(null);
  
  // UX State
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reserving, setReserving] = useState(false);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Cap data";
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("ca-ES", {
      weekday: "long",
      day: "numeric",
      month: "short",
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
    const input = hiddenDateInputRef.current;
    if (!input) return;

    try {
      input.focus();

      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }

      input.click();
    } catch (error) {
      input.focus();
      input.click();
    }
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
      setSelectedSlot(null);

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

  const handleManualDateChange = (newDate) => {
    if (!newDate) return;
    if (isPastDate(newDate)) {
      setError("No pots seleccionar una data anterior a avui.");
      return;
    }
    clearMessages();
    setDate(newDate);
  };

  const handleReserve = async () => {
    if (!selectedSlot) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Per reservar una pista, has d'iniciar sessió.");
        setShowAuthHelp(true);
        return;
      }

      clearMessages();
      setReserving(true);

      const response = await api.post("/reservations", {
        court_id: selectedSlot.court_id,
        time_slot_id: selectedSlot.time_slot_id,
        data_reserva: date,
        metode_pagament: paymentMethod,
      });

      const reservationData = response?.data?.data || null;

      setSuccess(`Reserva confirmada a ${selectedSlot.nom_pista} (${selectedSlot.hora_inici} - ${selectedSlot.hora_fi}).`);

      setReservationSummary({
        codi_reserva: reservationData?.codi_reserva || "No disponible",
        preu_total: reservationData?.preu_total != null ? reservationData.preu_total : reservationData?.preu != null ? reservationData.preu : null,
        metode_pagament: reservationData?.metode_pagament || paymentMethod,
        estat_pagament: reservationData?.estat_pagament || "No disponible",
        nom_pista: selectedSlot.nom_pista,
        hora_inici: selectedSlot.hora_inici,
        hora_fi: selectedSlot.hora_fi,
        data_reserva: date,
      });

      setSelectedSlot(null);
      fetchAvailability(date);

      scrollToElementWithOffset(topFeedbackRef.current, 120);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error creant la reserva.");
      scrollToElementWithOffset(topFeedbackRef.current, 120);
    } finally {
      setReserving(false);
    }
  };

  useEffect(() => {
    fetchAvailability(date);
  }, [date]);

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

  const courtsData = useMemo(() => {
    const map = new Map();
    filteredAvailability.forEach(slot => {
      if (!map.has(slot.nom_pista)) {
        map.set(slot.nom_pista, { nom_pista: slot.nom_pista, court_id: slot.court_id, slots: [] });
      }
      map.get(slot.nom_pista).slots.push(slot);
    });
    
    const courtsList = Array.from(map.values());
    courtsList.forEach(court => {
      court.slots.sort((a,b) => a.hora_inici.localeCompare(b.hora_inici));
    });
    return courtsList.sort((a,b) => a.nom_pista.localeCompare(b.nom_pista));
  }, [filteredAvailability]);

  return (
    <div className="ap-wrapper">
      
      {/* 1. HEADER MINIMALISTA */}
      <header className="ap-header">
        <div className="ap-header__inner">
          <h1 className="ap-title">Reserva de Pistes</h1>
          <p className="ap-subtitle">Selecciona el dia, la pista i l'hora desitjada.</p>
        </div>
      </header>

      <div className="ap-container">
        
        {/* 2. SELECTOR DE DIA COMPACTE */}
        <section className="ap-card ap-dates-card">
          <div className="ap-dates-scroll">
            {quickDays.map((day) => (
              <button
                key={day.iso}
                onClick={() => handleManualDateChange(day.iso)}
                className={`ap-day-btn ${date === day.iso ? "is-active" : ""}`}
              >
                <span className="ap-day-name">{day.weekday}</span>
                <span className="ap-day-num">{day.dayNumber}</span>
              </button>
            ))}
            
            <div className="ap-date-picker">
               <button onClick={handleOpenDatePicker} className="ap-day-btn ap-day-btn--cal">
                 <span className="ap-day-name">Més</span>
                 <span className="ap-day-num">📅</span>
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
          <div className="ap-date-filters">
            <span className="ap-selected-date-text">{formatDisplayDate(date)}</span>
            <label className="ap-filter-label">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              />
              Només disponibles
            </label>
          </div>
        </section>

        {/* FEEDBACK & ERRORS */}
        <div ref={topFeedbackRef}></div>
        {error && (
          <div className="ap-alert ap-alert--error fade-in">
            <strong>Error:</strong> {error}
          </div>
        )}
        {showAuthHelp && (
          <div className="ap-alert ap-alert--info fade-in">
            <p>Necessites iniciar sessió per reservar pistes.</p>
            <div className="ap-alert-actions">
              <Link to="/login" className="btn btn-primary btn-sm">Iniciar sessió</Link>
              <Link to="/register" className="btn btn-outline-primary btn-sm">Crear compte</Link>
            </div>
          </div>
        )}
        {success && reservationSummary && (
          <div className="ap-alert ap-alert--success fade-in fade-in-up">
            <div className="ap-success-header">
              <h3>🎉 Reserva Confirmada</h3>
              <span className="ap-success-code">{reservationSummary.codi_reserva}</span>
            </div>
            <div className="ap-success-details">
              <div><span>Pista:</span> <strong>{reservationSummary.nom_pista}</strong></div>
              <div><span>Data:</span> <strong>{reservationSummary.data_reserva}</strong></div>
              <div><span>Hora:</span> <strong>{reservationSummary.hora_inici} - {reservationSummary.hora_fi}</strong></div>
              <div><span>Pagament:</span> <strong>{reservationSummary.metode_pagament}</strong></div>
            </div>
            <div className="ap-success-actions">
              <Link to="/my-reservations" className="btn btn-success">Veure les meves reserves</Link>
              <button onClick={clearMessages} className="btn btn-outline-success">Nova reserva</button>
            </div>
          </div>
        )}

        {/* 3. TARGETES DE PISTES */}
        {loading ? (
          <div className="ap-loading"><LoadingSpinner /></div>
        ) : (
          <div className="ap-courts-grid">
            {courtsData.length === 0 && !error && !success ? (
               <div className="ap-empty-state">
                 <span>🎾</span>
                 <p>No hi ha franges disponibles per aquest dia.</p>
               </div>
            ) : (
              courtsData.map(court => (
                <div key={court.court_id} className="ap-court-card fade-in-up">
                  <div className="ap-court-header">
                    <h3 className="ap-court-name">{court.nom_pista}</h3>
                    <span className="ap-court-meta">{court.slots.filter(s => s.disponible).length} lliures</span>
                  </div>
                  <div className="ap-slots-grid">
                    {court.slots.map(slot => {
                      const isSelected = selectedSlot?.time_slot_id === slot.time_slot_id && selectedSlot?.court_id === slot.court_id;
                      return (
                        <button
                          key={slot.time_slot_id}
                          onClick={() => setSelectedSlot(isSelected ? null : slot)}
                          disabled={!slot.disponible}
                          className={`ap-slot-pill ${
                            !slot.disponible ? 'is-booked' : 
                            isSelected ? 'is-selected' : 'is-available'
                          }`}
                        >
                          {slot.hora_inici}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* 4. FLOATING RESERVATION ACTION */}
      {selectedSlot && !success && (
        <div className="ap-floating-action slide-up">
          <div className="ap-floating-inner">
            <div className="ap-floating-info">
              <span className="ap-floating-court">{selectedSlot.nom_pista}</span>
              <strong className="ap-floating-time">
                {formatDisplayDate(date)} • {selectedSlot.hora_inici} a {selectedSlot.hora_fi}
              </strong>
            </div>
            
            <div className="ap-floating-controls">
              <select
                className="ap-payment-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="online_simulat">Pagament Online</option>
                <option value="al_club">Pagament al Club</option>
              </select>
              
              <button 
                onClick={handleReserve} 
                disabled={reserving}
                className="btn btn-primary ap-reserve-btn"
              >
                {reserving ? 'Reservant...' : 'Confirmar Reserva'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ESPAI PER L'ACTION BAR INFERIOR */}
      {selectedSlot && !success && <div className="ap-bottom-spacing"></div>}

    </div>
  );
}

export default AvailabilityPage;