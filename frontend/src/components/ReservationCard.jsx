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
            style={styles.cancelButton}
          >
            Cancel·lar reserva
          </button>
        </div>
      )}

      {isActive && confirmingCancel && (
        <div style={styles.confirmBox}>
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
              style={styles.confirmDangerButton}
            >
              {isCancelling ? "Cancel·lant..." : "Sí, cancel·lar"}
            </button>

            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={onAbortCancel}
              disabled={isCancelling}
              style={styles.confirmSecondaryButton}
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
    transition: "0.25s ease",
  },

  cardConfirming: {
    border: "1px solid #fecaca",
    boxShadow: "0 12px 26px rgba(220,38,38,0.12)",
    transform: "scale(1.01)",
  },

  cardInactive: {
    opacity: 0.92,
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
    gap: "0.9rem",
    marginBottom: "1.2rem",
  },

  infoBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "0.9rem",
  },

  label: {
    display: "block",
    fontSize: "0.85rem",
    color: "#6b7280",
    marginBottom: "0.35rem",
    fontWeight: "700",
  },

  value: {
    margin: 0,
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize",
    lineHeight: 1.5,
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
  },

  cancelButton: {
    backgroundColor: "#dc2626",
    color: "white",
  },

  confirmBox: {
    backgroundColor: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "14px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
    animation: "fadeIn 0.35s ease",
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

  confirmSecondaryButton: {},
};

export default ReservationCard;