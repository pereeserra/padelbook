import { useEffect, useRef } from "react";

function ReservationCard({
  reservation,
  onCancel,
  isCancelling = false,
  confirmingCancel = false,
  onStartCancel,
  onAbortCancel,
}) {
  const isActive = reservation.estat === "activa";
  const cardRef = useRef(null);

  const slowScrollToCard = () => {
    if (!cardRef.current) return;

    const elementTop =
      cardRef.current.getBoundingClientRect().top + window.scrollY;

    const offset = 120;
    const targetPosition = elementTop - offset;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!confirmingCancel) return;

    const timeout = setTimeout(() => {
      slowScrollToCard();
    }, 180);

    return () => clearTimeout(timeout);
  }, [confirmingCancel]);

  const formattedDate = new Date(reservation.data_reserva).toLocaleDateString(
    "ca-ES",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <article
      ref={cardRef}
      style={{
        ...styles.card,
        ...(confirmingCancel ? styles.cardConfirming : {}),
        ...(!isActive ? styles.cardInactive : {}),
        ...(isCancelling ? styles.cardCancelling : {}),
      }}
    >
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{reservation.nom_pista}</h3>
          <p style={styles.subtitle}>Reserva de pista de pàdel</p>
        </div>

        <span
          style={{
            ...styles.badge,
            ...(isActive ? styles.badgeActive : styles.badgeInactive),
          }}
        >
          {reservation.estat}
        </span>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoBox}>
          <span style={styles.label}>Data</span>
          <p style={styles.value}>{formattedDate}</p>
        </div>

        <div style={styles.infoBox}>
          <span style={styles.label}>Hora</span>
          <p style={styles.value}>
            {reservation.hora_inici} - {reservation.hora_fi}
          </p>
        </div>
      </div>

      {isActive && !confirmingCancel && (
        <div style={styles.footer}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => onStartCancel(reservation.id)}
            disabled={isCancelling}
            style={{
              ...styles.cancelButton,
              ...(isCancelling ? styles.cancelButtonDisabled : {}),
            }}
          >
            {isCancelling ? "Cancel·lant..." : "Cancel·lar reserva"}
          </button>
        </div>
      )}

      {isActive && confirmingCancel && (
        <div className="scale-in" style={styles.confirmBox}>
          <p style={styles.confirmTitle}>Confirmar cancel·lació</p>

          <p style={styles.confirmText}>
            Segur que vols cancel·lar aquesta reserva de{" "}
            <strong>{reservation.nom_pista}</strong>?
          </p>

          <div style={styles.confirmActions}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onCancel(reservation.id)}
              disabled={isCancelling}
              style={{
                ...styles.confirmDangerButton,
                ...(isCancelling ? styles.confirmDangerButtonLoading : {}),
              }}
            >
              {isCancelling ? "Cancel·lant..." : "Sí, cancel·lar"}
            </button>

            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={onAbortCancel}
              disabled={isCancelling}
              style={{
                ...styles.confirmSecondaryButton,
                ...(isCancelling ? styles.confirmSecondaryButtonDisabled : {}),
              }}
            >
              Mantenir reserva
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
    padding: "1.4rem",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    transition: "all 0.25s ease",
    scrollMarginTop: "120px",
  },

  cardConfirming: {
    border: "1px solid #fecaca",
    boxShadow: "0 12px 26px rgba(220,38,38,0.12)",
    transform: "scale(1.01)",
  },

  cardInactive: {
    opacity: 0.92,
  },

  cardCancelling: {
    opacity: 0.85,
    pointerEvents: "none",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1.25rem",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "1.35rem",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: "0.35rem",
    marginBottom: 0,
    color: "#6b7280",
    fontSize: "0.95rem",
  },

  badge: {
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.9rem",
    textTransform: "capitalize",
  },

  badgeActive: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },

  badgeInactive: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.85rem",
  },

  infoBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "0.9rem 1rem",
  },

  label: {
    display: "block",
    marginBottom: "0.35rem",
    color: "#64748b",
    fontSize: "0.85rem",
    fontWeight: "700",
  },

  value: {
    margin: 0,
    color: "#0f172a",
    fontWeight: "700",
    lineHeight: 1.5,
    textTransform: "capitalize",
  },

  footer: {
    marginTop: "1.1rem",
    display: "flex",
    justifyContent: "flex-end",
  },

  cancelButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    padding: "0.7rem 1rem",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },

  cancelButtonDisabled: {
    backgroundColor: "#f87171",
    cursor: "not-allowed",
    opacity: 0.92,
  },

  confirmBox: {
    marginTop: "1.25rem",
    backgroundColor: "#fff7ed",
    border: "1px solid #fdba74",
    borderRadius: "16px",
    padding: "1rem",
  },

  confirmTitle: {
    marginTop: 0,
    marginBottom: "0.45rem",
    color: "#9a3412",
    fontSize: "1rem",
    fontWeight: "800",
  },

  confirmText: {
    marginTop: 0,
    marginBottom: "1rem",
    color: "#7c2d12",
    lineHeight: 1.6,
    fontWeight: "600",
  },

  confirmActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },

  confirmDangerButton: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    padding: "0.7rem 1rem",
    cursor: "pointer",
  },

  confirmDangerButtonLoading: {
    backgroundColor: "#b91c1c",
    cursor: "not-allowed",
    opacity: 0.95,
  },

  confirmSecondaryButton: {
    borderRadius: "10px",
    fontWeight: "700",
    padding: "0.7rem 1rem",
  },

  confirmSecondaryButtonDisabled: {
    opacity: 0.75,
    cursor: "not-allowed",
  },
};

export default ReservationCard;