function CourtCard({
  court,
  onDelete,
  onEdit,
  confirmingDelete = false,
  onStartDelete,
  onAbortDelete,
  isDeleting = false,
  isHighlighted = false,
}) {
  const isAvailable = court.estat === "disponible";
  const isCovered = Number(court.coberta) === 1;

  return (
    <article
      id={`court-${court.id}`}
      style={{
        ...styles.card,
        ...(confirmingDelete ? styles.cardConfirming : {}),
        ...(isHighlighted ? styles.cardHighlighted : {}),
      }}
    >
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{court.nom_pista}</h3>
          <p style={styles.subtitle}>Gestió individual de pista</p>
        </div>

        <span
          style={{
            ...styles.statusBadge,
            ...(isAvailable ? styles.statusAvailable : styles.statusMaintenance),
          }}
        >
          {court.estat}
        </span>
      </div>

      <div style={styles.badgesRow}>
        <span style={styles.infoBadge}>
          {court.tipus === "dobles" ? "Dobles" : "Individual"}
        </span>

        <span
          style={{
            ...styles.infoBadge,
            ...(isCovered ? styles.coveredBadge : styles.outdoorBadge),
          }}
        >
          {isCovered ? "Coberta" : "Exterior"}
        </span>
      </div>

      <div style={styles.descriptionBox}>
        <span style={styles.descriptionLabel}>Descripció</span>
        <p style={styles.descriptionText}>
          {court.descripcio || "Sense descripció."}
        </p>
      </div>

      {!confirmingDelete && (
        <div style={styles.footer}>
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={onEdit}
          >
            Editar pista
          </button>

          <button
            type="button"
            className="btn btn-sm"
            onClick={onStartDelete}
            style={styles.deleteButton}
          >
            Eliminar pista
          </button>
        </div>
      )}

      {confirmingDelete && (
        <div className="scale-in" style={styles.confirmBox}>
          <p style={styles.confirmTitle}>Confirmar eliminació</p>
          <p style={styles.confirmText}>
            Segur que vols eliminar la pista <strong>{court.nom_pista}</strong>?
            Aquesta acció no es pot desfer.
          </p>

          <div style={styles.confirmActions}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={onDelete}
              disabled={isDeleting}
              style={styles.confirmDangerButton}
            >
              {isDeleting ? "Eliminant..." : "Sí, eliminar"}
            </button>

            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={onAbortDelete}
              disabled={isDeleting}
            >
              Cancel·lar
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "1.25rem",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    minHeight: "100%",
    transition: "0.25s ease",
    scrollMarginTop: "120px",
  },
  cardConfirming: {
    border: "1px solid #fed7aa",
    boxShadow: "0 12px 26px rgba(234, 88, 12, 0.12)",
    transform: "translateY(-2px)",
  },
  cardHighlighted: {
    border: "1px solid #93c5fd",
    boxShadow: "0 0 0 4px rgba(59,130,246,0.12), 0 12px 26px rgba(37,99,235,0.14)",
    transform: "translateY(-2px)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.9rem",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: "0.35rem",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "0.95rem",
  },
  statusBadge: {
    padding: "0.42rem 0.8rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.85rem",
    textTransform: "capitalize",
  },
  statusAvailable: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusMaintenance: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  badgesRow: {
    display: "flex",
    gap: "0.55rem",
    flexWrap: "wrap",
  },
  infoBadge: {
    backgroundColor: "#e2e8f0",
    color: "#334155",
    padding: "0.38rem 0.72rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.82rem",
  },
  coveredBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },
  outdoorBadge: {
    backgroundColor: "#f1f5f9",
    color: "#334155",
  },
  descriptionBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "0.95rem",
  },
  descriptionLabel: {
    display: "block",
    fontSize: "0.82rem",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "0.4rem",
  },
  descriptionText: {
    margin: 0,
    color: "#334155",
    lineHeight: 1.65,
  },
  footer: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    color: "white",
  },
  confirmBox: {
    marginTop: "auto",
    backgroundColor: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "14px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  confirmTitle: {
    margin: 0,
    color: "#9a3412",
    fontWeight: "800",
    fontSize: "1rem",
  },
  confirmText: {
    margin: 0,
    color: "#7c2d12",
    lineHeight: 1.65,
  },
  confirmActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  confirmDangerButton: {
    backgroundColor: "#dc2626",
    color: "white",
  },
};

export default CourtCard;