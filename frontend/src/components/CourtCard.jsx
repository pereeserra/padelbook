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
          <span style={styles.eyebrow}>Pista</span>
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
    background: "rgba(255,255,255,0.86)",
    borderRadius: "26px",
    padding: "1.25rem",
    boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
    border: "1px solid rgba(148,163,184,0.18)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    minHeight: "100%",
    transition: "0.25s ease",
    scrollMarginTop: "120px",
    backdropFilter: "blur(10px)",
  },
  cardConfirming: {
    border: "1px solid #fdba74",
    boxShadow: "0 16px 34px rgba(234,88,12,0.12)",
    transform: "translateY(-2px)",
  },
  cardHighlighted: {
    border: "1px solid #93c5fd",
    boxShadow:
      "0 0 0 4px rgba(59,130,246,0.12), 0 18px 34px rgba(37,99,235,0.14)",
    transform: "translateY(-2px)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.9rem",
    flexWrap: "wrap",
  },
  eyebrow: {
    display: "inline-block",
    marginBottom: "0.35rem",
    fontSize: "0.78rem",
    color: "#64748b",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  title: {
    margin: 0,
    fontSize: "1.35rem",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: "0.35rem",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "0.95rem",
    lineHeight: 1.55,
  },
  statusBadge: {
    padding: "0.42rem 0.8rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.84rem",
    textTransform: "capitalize",
    border: "1px solid transparent",
  },
  statusAvailable: {
    background: "#ecfdf5",
    color: "#15803d",
    borderColor: "#bbf7d0",
  },
  statusMaintenance: {
    background: "#fff1f2",
    color: "#be123c",
    borderColor: "#fecdd3",
  },
  badgesRow: {
    display: "flex",
    gap: "0.55rem",
    flexWrap: "wrap",
  },
  infoBadge: {
    background: "#f8fafc",
    color: "#334155",
    padding: "0.38rem 0.72rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.82rem",
    border: "1px solid #e2e8f0",
  },
  coveredBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    borderColor: "#dbeafe",
  },
  outdoorBadge: {
    background: "#f8fafc",
    color: "#334155",
    borderColor: "#e2e8f0",
  },
  descriptionBox: {
    background: "rgba(248,250,252,0.96)",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "1rem",
  },
  descriptionLabel: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "800",
    color: "#64748b",
    marginBottom: "0.38rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  descriptionText: {
    margin: 0,
    color: "#334155",
    lineHeight: 1.7,
  },
  footer: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  deleteButton: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    boxShadow: "0 12px 24px rgba(220,38,38,0.16)",
  },
  confirmBox: {
    marginTop: "auto",
    background: "#fff7ed",
    border: "1px solid #fdba74",
    borderRadius: "18px",
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
    fontWeight: "600",
  },
  confirmActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  confirmDangerButton: {
    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
    color: "white",
    border: "none",
  },
};

export default CourtCard;