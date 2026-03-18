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
  const courtTypeLabel = court.tipus === "dobles" ? "Dobles" : "Individual";
  const courtModeLabel = isCovered ? "Indoor" : "Outdoor";
  const statusLabel = isAvailable ? "Disponible" : "Manteniment";

  return (
    <article
      id={`court-${court.id}`}
      style={{
        ...styles.card,
        ...(confirmingDelete ? styles.cardConfirming : {}),
        ...(isHighlighted ? styles.cardHighlighted : {}),
      }}
    >
      <div style={styles.topBar}>
        <span style={styles.eyebrow}>Pista #{court.id}</span>

        <span
          style={{
            ...styles.statusBadge,
            ...(isAvailable ? styles.statusAvailable : styles.statusMaintenance),
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div style={styles.header}>
        <div style={styles.identityBlock}>
          <h3 style={styles.title}>{court.nom_pista}</h3>
          <p style={styles.subtitle}>Gestió individual i estat actual de la pista</p>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Tipus</span>
          <span style={styles.summaryValue}>{courtTypeLabel}</span>
        </div>

        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Modalitat</span>
          <span style={styles.summaryValue}>{courtModeLabel}</span>
        </div>
      </div>

      <div style={styles.badgesRow}>
        <span style={styles.infoBadge}>{courtTypeLabel}</span>

        <span
          style={{
            ...styles.infoBadge,
            ...(isCovered ? styles.coveredBadge : styles.outdoorBadge),
          }}
        >
          {courtModeLabel}
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
    background: "rgba(255,255,255,0.9)",
    borderRadius: "26px",
    padding: "1.25rem",
    boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
    border: "1px solid rgba(148,163,184,0.18)",
    display: "flex",
    flexDirection: "column",
    gap: "0.95rem",
    minHeight: "100%",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
  },
  cardConfirming: {
    borderColor: "#fdba74",
    boxShadow: "0 18px 42px rgba(249,115,22,0.12)",
  },
  cardHighlighted: {
    borderColor: "#93c5fd",
    boxShadow: "0 0 0 4px rgba(37,99,235,0.08), 0 20px 46px rgba(37,99,235,0.14)",
    transform: "translateY(-2px)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
  },
  identityBlock: {
    minWidth: 0,
  },
  eyebrow: {
    display: "inline-block",
    fontSize: "0.78rem",
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "1.3rem",
    fontWeight: "800",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  subtitle: {
    margin: "0.4rem 0 0 0",
    color: "#64748b",
    lineHeight: 1.6,
    fontWeight: "600",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "34px",
    padding: "0.35rem 0.8rem",
    borderRadius: "999px",
    fontSize: "0.82rem",
    fontWeight: "800",
    textTransform: "capitalize",
    border: "1px solid transparent",
    whiteSpace: "nowrap",
  },
  statusAvailable: {
    background: "#ecfdf5",
    color: "#15803d",
    borderColor: "#bbf7d0",
  },
  statusMaintenance: {
    background: "#fff7ed",
    color: "#c2410c",
    borderColor: "#fdba74",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  summaryItem: {
    borderRadius: "18px",
    padding: "0.85rem 0.95rem",
    background: "linear-gradient(180deg, #f8fafc, #ffffff)",
    border: "1px solid rgba(148,163,184,0.16)",
  },
  summaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "0.75rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "0.28rem",
  },
  summaryValue: {
    color: "#0f172a",
    fontWeight: "800",
    lineHeight: 1.5,
  },
  badgesRow: {
    display: "flex",
    gap: "0.55rem",
    flexWrap: "wrap",
  },
  infoBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "33px",
    padding: "0.35rem 0.8rem",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #dbeafe",
    fontSize: "0.82rem",
    fontWeight: "800",
  },
  coveredBadge: {
    background: "#eefdf4",
    color: "#15803d",
    borderColor: "#bbf7d0",
  },
  outdoorBadge: {
    background: "#fff7ed",
    color: "#c2410c",
    borderColor: "#fdba74",
  },
  descriptionBox: {
    borderRadius: "20px",
    background: "#f8fafc",
    border: "1px solid rgba(148,163,184,0.16)",
    padding: "1rem",
  },
  descriptionLabel: {
    display: "block",
    fontSize: "0.76rem",
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