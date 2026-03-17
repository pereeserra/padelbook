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
        <div style={styles.slotLeft}>
          <div style={styles.slotTimeBlock}>
            <span
              style={{
                ...styles.time,
                ...(!slot.disponible ? styles.timeOccupied : {}),
              }}
            >
              {slot.hora_inici} - {slot.hora_fi}
            </span>

            <span style={styles.slotSubtext}>
              {slot.disponible
                ? "Reserva disponible ara mateix"
                : "Aquesta franja ja està ocupada"}
            </span>
          </div>

          <div style={styles.slotMeta}>
            <span
              style={{
                ...styles.badge,
                ...(slot.disponible ? styles.badgeAvailable : styles.badgeOccupied),
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
          const availabilityPercentage = slots.length
            ? Math.round((availableSlots.length / slots.length) * 100)
            : 0;

          return (
            <article key={courtName} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.cardEyebrow}>Pista</span>
                  <h3 style={styles.courtTitle}>{courtName}</h3>
                  <p style={styles.courtSubtitle}>
                    Consulta ràpidament les franges disponibles i reserva directament
                    des d’aquesta targeta.
                  </p>
                </div>

                <div style={styles.headerSide}>
                  <span style={styles.percentageBadge}>
                    {availabilityPercentage}% lliure
                  </span>

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
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${availabilityPercentage}%`,
                  }}
                />
              </div>

              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h4 style={styles.sectionTitle}>Franges disponibles</h4>
                    <p style={styles.sectionText}>
                      Horaris que es poden reservar ara mateix.
                    </p>
                  </div>

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
                  <div>
                    <h4 style={styles.sectionTitle}>Franges ocupades</h4>
                    <p style={styles.sectionText}>
                      Horaris que ja no es poden reservar.
                    </p>
                  </div>

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
            </article>
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
    background: "rgba(255,255,255,0.86)",
    borderRadius: "28px",
    padding: "1.25rem",
    boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
    border: "1px solid rgba(148,163,184,0.18)",
    backdropFilter: "blur(10px)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  cardEyebrow: {
    display: "inline-block",
    marginBottom: "0.4rem",
    fontSize: "0.78rem",
    color: "#64748b",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  courtTitle: {
    margin: 0,
    fontSize: "1.4rem",
    color: "#0f172a",
  },
  courtSubtitle: {
    marginTop: "0.35rem",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "0.95rem",
    maxWidth: "360px",
    lineHeight: 1.65,
  },
  headerSide: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.7rem",
  },
  percentageBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "0.42rem 0.78rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.84rem",
    border: "1px solid #dbeafe",
  },
  headerBadges: {
    display: "flex",
    gap: "0.45rem",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  slotCount: {
    background: "#f8fafc",
    color: "#475569",
    padding: "0.38rem 0.72rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.82rem",
    border: "1px solid #e2e8f0",
  },
  availableCount: {
    background: "#ecfdf5",
    color: "#15803d",
    padding: "0.38rem 0.72rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.82rem",
    border: "1px solid #bbf7d0",
  },
  occupiedCount: {
    background: "#fff1f2",
    color: "#be123c",
    padding: "0.38rem 0.72rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.82rem",
    border: "1px solid #fecdd3",
  },
  progressTrack: {
    width: "100%",
    height: "11px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "1rem",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #16a34a, #22c55e)",
    borderRadius: "999px",
  },
  section: {
    marginTop: "1.15rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.8rem",
    marginBottom: "0.8rem",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.02rem",
    color: "#0f172a",
  },
  sectionText: {
    marginTop: "0.25rem",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "0.9rem",
    lineHeight: 1.55,
  },
  sectionBadgeGreen: {
    background: "#ecfdf5",
    color: "#15803d",
    padding: "0.34rem 0.68rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.8rem",
    border: "1px solid #bbf7d0",
  },
  sectionBadgeRed: {
    background: "#fff1f2",
    color: "#be123c",
    padding: "0.34rem 0.68rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.8rem",
    border: "1px solid #fecdd3",
  },
  slotsList: {
    display: "grid",
    gap: "0.75rem",
  },
  slotRow: {
    borderRadius: "20px",
    padding: "0.95rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.9rem",
    flexWrap: "wrap",
    transition: "all 0.22s ease",
    border: "1px solid transparent",
  },
  availableRow: {
    background: "rgba(240,253,244,0.9)",
    borderColor: "#bbf7d0",
  },
  occupiedRow: {
    background: "rgba(255,241,242,0.9)",
    borderColor: "#fecdd3",
  },
  recentlyReservedRow: {
    boxShadow: "0 0 0 4px rgba(37,99,235,0.10)",
    transform: "translateY(-1px)",
  },
  slotLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "0.65rem",
    flex: 1,
    minWidth: "220px",
  },
  slotTimeBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "0.22rem",
  },
  time: {
    fontWeight: "800",
    color: "#0f172a",
    fontSize: "1rem",
  },
  timeOccupied: {
    color: "#7f1d1d",
  },
  slotSubtext: {
    color: "#64748b",
    fontSize: "0.88rem",
    lineHeight: 1.45,
  },
  slotMeta: {
    display: "flex",
    gap: "0.45rem",
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.35rem 0.7rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.78rem",
    border: "1px solid transparent",
  },
  badgeAvailable: {
    background: "#dcfce7",
    color: "#166534",
    borderColor: "#86efac",
  },
  badgeOccupied: {
    background: "#fee2e2",
    color: "#991b1b",
    borderColor: "#fecaca",
  },
  justReservedBadge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "0.35rem 0.7rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.78rem",
    border: "1px solid #bfdbfe",
  },
  reserveButton: {
    minWidth: "140px",
    border: "none",
    borderRadius: "999px",
    padding: "0.85rem 1rem",
    fontWeight: "800",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  reserveButtonAvailable: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    boxShadow: "0 14px 24px rgba(37,99,235,0.18)",
  },
  reserveButtonDisabled: {
    background: "#e2e8f0",
    color: "#64748b",
    cursor: "not-allowed",
  },
  reserveButtonLoading: {
    opacity: 0.9,
  },
  emptyMiniState: {
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    color: "#64748b",
    borderRadius: "18px",
    padding: "1rem",
    lineHeight: 1.6,
    fontWeight: "600",
  },
};

export default AvailabilityTable;