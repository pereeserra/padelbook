import { useEffect, useRef } from "react";

function ReservationCard({
  reservation,
  onCancel,
  onDeleteCancelled,
  isCancelling = false,
  isDeletingCancelled = false,
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
        ...(isCancelling || isDeletingCancelled ? styles.cardBusy : {}),
      }}
    >
      <div style={styles.header}>
        <div>
          <span style={styles.eyebrow}>Reserva de pista</span>

          <div style={styles.titleRow}>
            <span style={styles.titleIcon} aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="16" rx="3" />
                <path d="M16 3v4" />
                <path d="M8 3v4" />
                <path d="M3 10h18" />
              </svg>
            </span>

            <h3 style={styles.title}>{reservation.nom_pista}</h3>
          </div>

          <p style={styles.subtitle}>
            Consulta el detall i gestiona la teva reserva
          </p>
        </div>

        <div style={styles.headerActions}>
          {!isActive && (
            <button
              type="button"
              onClick={() => onDeleteCancelled(reservation.id)}
              disabled={isDeletingCancelled}
              title="Eliminar reserva cancel·lada"
              aria-label="Eliminar reserva cancel·lada"
              style={{
                ...styles.deleteIconButton,
                ...(isDeletingCancelled ? styles.deleteIconButtonDisabled : {}),
              }}
            >
              {isDeletingCancelled ? (
                <span style={styles.deleteLoadingDots}>···</span>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              )}
            </button>
          )}

          <span
            style={{
              ...styles.badge,
              ...(isActive ? styles.badgeActive : styles.badgeInactive),
            }}
          >
            <span
              style={{
                ...styles.badgeDot,
                ...(isActive ? styles.badgeDotActive : styles.badgeDotInactive),
              }}
            />

            {reservation.estat}
          </span>
        </div>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoBox}>
          <span style={styles.label}>Codi reserva</span>
          <p style={styles.value}>{reservation.codi_reserva || "No disponible"}</p>
        </div>

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

        <div style={styles.infoBox}>
          <span style={styles.label}>Preu</span>
          <p style={styles.value}>
            {reservation.preu_total != null
              ? `${Number(reservation.preu_total).toFixed(2)} €`
              : reservation.preu != null
              ? `${Number(reservation.preu).toFixed(2)} €`
              : "No disponible"}
          </p>
        </div>

        <div style={styles.infoBox}>
          <span style={styles.label}>Pagament</span>
          <p style={styles.value}>
            {reservation.metode_pagament || "No disponible"}
          </p>
        </div>

        <div style={styles.infoBox}>
          <span style={styles.label}>Estat pagament</span>
          <p style={styles.value}>
            {reservation.estat_pagament || "No disponible"}
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
    background: "rgba(255,255,255,0.9)",
    borderRadius: "26px",
    padding: "1.35rem",
    boxShadow: "0 18px 36px rgba(15,23,42,0.06)",
    border: "1px solid rgba(148,163,184,0.16)",
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
    opacity: 0.97,
  },
  cardBusy: {
    opacity: 0.8,
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
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    flexWrap: "wrap",
  },
  eyebrow: {
    display: "inline-block",
    marginBottom: "0.45rem",
    fontSize: "0.76rem",
    color: "#64748b",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
  },
  titleIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #dbeafe",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: "1.35rem",
    color: "#0f172a",
    lineHeight: 1.15,
  },
  subtitle: {
    marginTop: "0.45rem",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "0.95rem",
    lineHeight: 1.6,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.85rem",
    textTransform: "capitalize",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
  },
  badgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  badgeDotActive: {
    background: "#16a34a",
  },
  badgeDotInactive: {
    background: "#dc2626",
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
  deleteIconButton: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: "1px solid #fecaca",
    background: "linear-gradient(180deg, #fff5f5, #ffe4e6)",
    color: "#dc2626",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 20px rgba(220,38,38,0.10)",
    transition: "all 0.2s ease",
  },
  deleteIconButtonDisabled: {
    opacity: 0.75,
    cursor: "not-allowed",
  },
  deleteLoadingDots: {
    fontWeight: "800",
    letterSpacing: "0.08em",
    fontSize: "0.95rem",
    lineHeight: 1,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.9rem",
  },
  infoBox: {
    background: "linear-gradient(180deg, rgba(248,250,252,0.96), #ffffff)",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "1rem",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
  },
  label: {
    display: "block",
    marginBottom: "0.38rem",
    color: "#64748b",
    fontSize: "0.8rem",
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
    marginTop: "1.15rem",
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