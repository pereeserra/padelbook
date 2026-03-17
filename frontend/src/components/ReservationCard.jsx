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
          <span style={styles.eyebrow}>Reserva de pista</span>
          <h3 style={styles.title}>{reservation.nom_pista}</h3>
          <p style={styles.subtitle}>Gestió ràpida de la teva reserva</p>
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
    background: "rgba(255,255,255,0.86)",
    borderRadius: "24px",
    padding: "1.3rem",
    boxShadow: "0 16px 34px rgba(15,23,42,0.05)",
    border: "1px solid rgba(148,163,184,0.18)",
    transition: "all 0.25s ease",
    scrollMarginTop: "120px",
    backdropFilter: "blur(10px)",
  },
  cardConfirming: {
    border: "1px solid #fecaca",
    boxShadow: "0 16px 34px rgba(220,38,38,0.10)",
    transform: "scale(1.01)",
  },
  cardInactive: {
    opacity: 0.94,
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
    marginBottom: "1.15rem",
    flexWrap: "wrap",
  },
  eyebrow: {
    display: "inline-block",
    marginBottom: "0.4rem",
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
    lineHeight: 1.6,
  },
  badge: {
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.88rem",
    textTransform: "capitalize",
  },
  badgeActive: {
    background: "#ecfdf5",
    color: "#15803d",
    border: "1px solid #bbf7d0",
  },
  badgeInactive: {
    background: "#fff1f2",
    color: "#be123c",
    border: "1px solid #fecdd3",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.85rem",
  },
  infoBox: {
    background: "rgba(248,250,252,0.95)",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "0.95rem 1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.35rem",
    color: "#64748b",
    fontSize: "0.82rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  value: {
    margin: 0,
    color: "#0f172a",
    fontWeight: "700",
    lineHeight: 1.55,
    textTransform: "capitalize",
  },
  footer: {
    marginTop: "1.1rem",
    display: "flex",
    justifyContent: "flex-end",
  },
  cancelButton: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    borderRadius: "999px",
    fontWeight: "800",
    padding: "0.78rem 1rem",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(220,38,38,0.16)",
  },
  cancelButtonDisabled: {
    background: "#f87171",
    cursor: "not-allowed",
    opacity: 0.92,
  },
  confirmBox: {
    marginTop: "1.25rem",
    background: "#fff7ed",
    border: "1px solid #fdba74",
    borderRadius: "20px",
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
    borderRadius: "999px",
    fontWeight: "800",
    padding: "0.75rem 1rem",
    cursor: "pointer",
  },
  confirmDangerButtonLoading: {
    background: "#b91c1c",
    cursor: "not-allowed",
    opacity: 0.95,
  },
  confirmSecondaryButton: {
    borderRadius: "999px",
    fontWeight: "800",
    padding: "0.75rem 1rem",
  },
  confirmSecondaryButtonDisabled: {
    opacity: 0.75,
    cursor: "not-allowed",
  },
};

export default ReservationCard;