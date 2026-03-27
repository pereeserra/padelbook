import "./AvailabilityTable.css";

function AvailabilityTable({
  availability,
  onReserve,
  reservingSlot,
  recentlyReservedSlot,
  selectedDate,
}) {
  if (!availability.length) return null;

  // Agrupar les franges per pista
  const groupedCourts = availability.reduce((acc, slot) => {
    const courtName = slot.nom_pista;

    if (!acc[courtName]) {
      acc[courtName] = [];
    }

    acc[courtName].push(slot);
    return acc;
  }, {});

  // Funció per determinar si una franja és la que s'ha reservat recentment
  const isRecentlyReserved = (slot) => {
    if (!recentlyReservedSlot) return false;

    return (
      recentlyReservedSlot.court_id === slot.court_id &&
      recentlyReservedSlot.time_slot_id === slot.time_slot_id &&
      recentlyReservedSlot.data_reserva === selectedDate
    );
  };

  // Funció per obtenir una etiqueta curta del motiu de no disponibilitat
  const getUnavailableLabel = (slot) => {
    if (slot.motiu_no_disponible === "manteniment") {
      return "Manteniment";
    }

    if (slot.motiu_no_disponible === "reserva") {
      return "Ocupada";
    }

    return "No disponible";
  };

  // Funció per obtenir el detall complet del motiu de no disponibilitat
  const getUnavailableDetail = (slot) => {
    if (slot.detall_no_disponible) {
      return slot.detall_no_disponible;
    }

    if (slot.motiu_no_disponible === "manteniment") {
      return "Pista bloquejada per manteniment";
    }

    if (slot.motiu_no_disponible === "reserva") {
      return "Aquesta franja ja està ocupada";
    }

    return "Aquesta franja no està disponible";
  };

  // Funció per renderitzar cada fila de franja
  const renderSlotRow = (slot, index) => {
    const justReserved = isRecentlyReserved(slot);
    const slotKey = `${slot.court_id}-${slot.time_slot_id}`;
    const isReserving = reservingSlot === slotKey;

    const rowClass = [
      "avail-table__slot-row",
      slot.disponible ? "avail-table__slot-row--available" : "avail-table__slot-row--occupied",
      justReserved ? "avail-table__slot-row--recently-reserved" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const buttonClass = [
      "avail-table__reserve-button",
      slot.disponible
        ? "avail-table__reserve-button--available"
        : "avail-table__reserve-button--disabled",
      isReserving ? "avail-table__reserve-button--loading" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div key={`${slot.court_id}-${slot.time_slot_id}-${index}`} className={rowClass}>
        <div className="avail-table__slot-left">
          <div className="avail-table__slot-time-block">
            <span
              className={`avail-table__time ${
                !slot.disponible ? "avail-table__time--occupied" : ""
              }`}
            >
              {slot.hora_inici} - {slot.hora_fi}
            </span>

            <span className="avail-table__slot-subtext">
              {slot.disponible
                ? "Reserva disponible ara mateix"
                : getUnavailableDetail(slot)}
            </span>
          </div>

          <div className="avail-table__slot-meta">
            <span
              className={`avail-table__badge ${
                slot.disponible
                  ? "avail-table__badge--available"
                  : slot.motiu_no_disponible === "manteniment"
                    ? "avail-table__badge--maintenance"
                    : "avail-table__badge--occupied"
              }`}
            >
              {slot.disponible ? "Disponible" : getUnavailableLabel(slot)}
            </span>

            {justReserved && (
              <span className="avail-table__just-reserved-badge">Reservada ara</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onReserve(slot)}
          disabled={!slot.disponible || isReserving}
          title={!slot.disponible ? getUnavailableDetail(slot) : "Reservar aquesta franja"}
          className={buttonClass}
        >
          {!slot.disponible
            ? "No disponible"
            : isReserving
            ? "Reservant..."
            : "Reservar"}
        </button>
      </div>
    );
  };

  return (
    <div className="avail-table__wrapper">
      <div className="avail-table__grid">
        {Object.entries(groupedCourts).map(([courtName, slots]) => {
          const availableSlots = slots.filter((slot) => slot.disponible);
          const occupiedSlots = slots.filter((slot) => !slot.disponible);
          const occupiedByReservation = slots.filter(
            (slot) => !slot.disponible && slot.motiu_no_disponible === "reserva"
          );
          const occupiedByMaintenance = slots.filter(
            (slot) => !slot.disponible && slot.motiu_no_disponible === "manteniment"
          );
          const availabilityPercentage = slots.length
            ? Math.round((availableSlots.length / slots.length) * 100)
            : 0;

          return (
            <article key={courtName} className="avail-table__card">
              <div className="avail-table__card-header">
                <div>
                  <span className="avail-table__card-eyebrow">Pista</span>
                  <h3 className="avail-table__court-title">{courtName}</h3>
                  <p className="avail-table__court-subtitle">
                    Consulta ràpidament les franges disponibles i reserva directament
                    des d'aquesta targeta.
                  </p>
                </div>

                <div className="avail-table__header-side">
                  <span className="avail-table__percentage-badge">
                    {availabilityPercentage}% lliure
                  </span>

                  <div className="avail-table__header-badges">
                    <span className="avail-table__slot-count">{slots.length} franges</span>
                    <span className="avail-table__available-count">
                      {availableSlots.length} lliures
                    </span>
                    <span className="avail-table__occupied-count">
                      {occupiedSlots.length} ocupades
                    </span>
                    <span className="avail-table__maintenance-count">
                      {occupiedByMaintenance.length} manteniment
                    </span>
                    <span className="avail-table__reservation-count">
                      {occupiedByReservation.length} reserva
                    </span>
                  </div>
                </div>
              </div>

              <div className="avail-table__progress-track">
                <div
                  className="avail-table__progress-fill"
                  style={{ width: `${availabilityPercentage}%` }}
                />
              </div>

              <div className="avail-table__section">
                <div className="avail-table__section-header">
                  <div>
                    <h4 className="avail-table__section-title">Franges disponibles</h4>
                    <p className="avail-table__section-text">
                      Horaris que es poden reservar ara mateix.
                    </p>
                  </div>

                  <span className="avail-table__section-badge--green">
                    {availableSlots.length}
                  </span>
                </div>

                {availableSlots.length > 0 ? (
                  <div className="avail-table__slots-list">
                    {availableSlots.map((slot, index) =>
                      renderSlotRow(slot, index)
                    )}
                  </div>
                ) : (
                  <div className="avail-table__empty-mini-state">
                    No hi ha franges disponibles en aquesta pista.
                  </div>
                )}
              </div>

              <div className="avail-table__section">
                <div className="avail-table__section-header">
                  <div>
                    <h4 className="avail-table__section-title">Franges ocupades</h4>
                    <p className="avail-table__section-text">
                      Horaris que ja no es poden reservar.
                    </p>
                  </div>

                  <span className="avail-table__section-badge--red">
                    {occupiedSlots.length}
                  </span>
                </div>

                {occupiedSlots.length > 0 ? (
                  <div className="avail-table__slots-list">
                    {occupiedSlots.map((slot, index) =>
                      renderSlotRow(slot, index)
                    )}
                  </div>
                ) : (
                  <div className="avail-table__empty-mini-state">
                    No hi ha franges ocupades en aquesta pista.
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default AvailabilityTable;