function AvailabilityTable({
  availability,
  onReserve,
  reservingSlot,
  recentlyReservedSlot,
  selectedDate,
}) {
  if (!availability.length) return null;

  const groupedCourts = availability.reduce((acc, slot) => {
    const courtName = slot.nom_pista;

    if (!acc[courtName]) {
      acc[courtName] = [];
    }

    acc[courtName].push(slot);
    return acc;
  }, {});

  const isRecentlyReserved = (slot) => {
    if (!recentlyReservedSlot) return false;

    return (
      recentlyReservedSlot.court_id === slot.court_id &&
      recentlyReservedSlot.time_slot_id === slot.time_slot_id &&
      recentlyReservedSlot.data_reserva === selectedDate
    );
  };

  const renderSlotRow = (slot, index) => {
    const justReserved = isRecentlyReserved(slot);
    const slotKey = `${slot.court_id}-${slot.time_slot_id}`;
    const isReserving = reservingSlot === slotKey;

    return (
      <div
        key={`${slot.court_id}-${slot.time_slot_id}-${index}`}
        style={{
          ...styles.slotRow,
          ...(slot.disponible ? styles.availableRow : styles.occupiedRow),
          ...(justReserved ? styles.recentlyReservedRow : {}),
        }}
      >
        <div style={styles.slotInfo}>
          <span
            style={{
              ...styles.time,
              ...(!slot.disponible ? styles.timeOccupied : {}),
            }}
          >
            {slot.hora_inici} - {slot.hora_fi}
          </span>

          <div style={styles.slotMeta}>
            <span
              style={{
                ...styles.badge,
                backgroundColor: slot.disponible ? "#dcfce7" : "#fee2e2",
                color: slot.disponible ? "#166534" : "#991b1b",
              }}
            >
              {slot.disponible ? "Disponible" : "Ocupada"}
            </span>

            {justReserved && (
              <span style={styles.justReservedBadge}>Reservada ara</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onReserve(slot)}
          disabled={!slot.disponible || isReserving}
          style={{
            ...styles.reserveButton,
            ...(slot.disponible
              ? styles.reserveButtonAvailable
              : styles.reserveButtonDisabled),
            ...(isReserving ? styles.reserveButtonLoading : {}),
          }}
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
    <div style={styles.wrapper}>
      <div style={styles.grid}>
        {Object.entries(groupedCourts).map(([courtName, slots]) => {
          const availableSlots = slots.filter((slot) => slot.disponible);
          const occupiedSlots = slots.filter((slot) => !slot.disponible);

          return (
            <div key={courtName} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.courtTitle}>{courtName}</h3>
                  <p style={styles.courtSubtitle}>
                    Consulta i reserva les franges disponibles d’aquesta pista.
                  </p>
                </div>

                <div style={styles.headerBadges}>
                  <span style={styles.slotCount}>{slots.length} franges</span>
                  <span style={styles.availableCount}>
                    {availableSlots.length} lliures
                  </span>
                  <span style={styles.occupiedCount}>
                    {occupiedSlots.length} ocupades
                  </span>
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h4 style={styles.sectionTitle}>Franges disponibles</h4>
                  <span style={styles.sectionBadgeGreen}>
                    {availableSlots.length}
                  </span>
                </div>

                {availableSlots.length > 0 ? (
                  <div style={styles.slotsList}>
                    {availableSlots.map((slot, index) =>
                      renderSlotRow(slot, index)
                    )}
                  </div>
                ) : (
                  <div style={styles.emptyMiniState}>
                    No hi ha franges disponibles en aquesta pista.
                  </div>
                )}
              </div>

              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h4 style={styles.sectionTitle}>Franges ocupades</h4>
                  <span style={styles.sectionBadgeRed}>
                    {occupiedSlots.length}
                  </span>
                </div>

                {occupiedSlots.length > 0 ? (
                  <div style={styles.slotsList}>
                    {occupiedSlots.map((slot, index) =>
                      renderSlotRow(slot, index)
                    )}
                  </div>
                ) : (
                  <div style={styles.emptyMiniState}>
                    No hi ha franges ocupades en aquesta pista.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "1rem",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "1.25rem",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  courtTitle: {
    margin: 0,
    fontSize: "1.3rem",
    color: "#0f172a",
  },
  courtSubtitle: {
    marginTop: "0.35rem",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "0.95rem",
    maxWidth: "300px",
    lineHeight: 1.55,
  },
  headerBadges: {
    display: "flex",
    gap: "0.45rem",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  slotCount: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    padding: "0.4rem 0.75rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.85rem",
  },
  availableCount: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "0.4rem 0.75rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.85rem",
  },
  occupiedCount: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "0.4rem 0.75rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.85rem",
  },
  section: {
    marginTop: "1.1rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.8rem",
    marginBottom: "0.75rem",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1rem",
    color: "#0f172a",
  },
  sectionBadgeGreen: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "0.3rem 0.65rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.8rem",
  },
  sectionBadgeRed: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "0.3rem 0.65rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.8rem",
  },
  slotsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  slotRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    padding: "0.9rem",
    borderRadius: "12px",
    flexWrap: "wrap",
    transition: "all 0.2s ease",
  },
  availableRow: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
  },
  occupiedRow: {
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    opacity: 0.88,
  },
  recentlyReservedRow: {
    border: "2px solid #22c55e",
    backgroundColor: "#f0fdf4",
    boxShadow: "0 0 0 4px rgba(34,197,94,0.08)",
  },
  slotInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  slotMeta: {
    display: "flex",
    gap: "0.45rem",
    flexWrap: "wrap",
    alignItems: "center",
  },
  time: {
    fontWeight: "700",
    color: "#111827",
  },
  timeOccupied: {
    color: "#6b7280",
  },
  badge: {
    padding: "0.35rem 0.65rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.85rem",
    display: "inline-block",
    width: "fit-content",
  },
  justReservedBadge: {
    backgroundColor: "#bbf7d0",
    color: "#166534",
    padding: "0.35rem 0.65rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.85rem",
  },
  reserveButton: {
    padding: "0.7rem 1rem",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    minWidth: "120px",
    color: "white",
    transition: "all 0.2s ease",
  },
  reserveButtonAvailable: {
    backgroundColor: "#16a34a",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  reserveButtonDisabled: {
    backgroundColor: "#cbd5e1",
    color: "#475569",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  reserveButtonLoading: {
    backgroundColor: "#15803d",
    cursor: "not-allowed",
    opacity: 0.95,
  },
  emptyMiniState: {
    backgroundColor: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "12px",
    padding: "0.9rem",
    color: "#64748b",
    fontWeight: "600",
  },
};

export default AvailabilityTable;