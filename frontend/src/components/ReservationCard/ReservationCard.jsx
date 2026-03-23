import { useEffect, useRef } from "react";
import "./ReservationCard.css";

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

  const paymentMethodLabel = (method) => {
    if (!method) return "No disponible";
    if (method === "online_simulat") return "Online";
    if (method === "al_club") return "Al club";
    return method;
  };

  const paymentStatusLabel = (status) => {
    if (!status) return "No disponible";
    if (status === "pagat") return "Pagat";
    if (status === "pendent") return "Pendent";
    return status;
  };

  const paymentMethodBadgeClass = (method) => {
    if (method === "online_simulat") {
      return "res-card__value-badge res-card__value-badge--blue";
    }

    if (method === "al_club") {
      return "res-card__value-badge res-card__value-badge--amber";
    }

    return "res-card__value-badge res-card__value-badge--neutral";
  };

  const paymentStatusBadgeClass = (status) => {
    if (status === "pagat") {
      return "res-card__value-badge res-card__value-badge--green";
    }

    if (status === "pendent") {
      return "res-card__value-badge res-card__value-badge--rose";
    }

    return "res-card__value-badge res-card__value-badge--neutral";
  };

  const cardClass = [
    "res-card",
    confirmingCancel ? "res-card--confirming" : "",
    !isActive ? "res-card--inactive" : "",
    isCancelling || isDeletingCancelled ? "res-card--busy" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article ref={cardRef} className={cardClass}>
      <div className="res-card__header">
        <div>
          <span className="res-card__eyebrow">Reserva de pista</span>

          <div className="res-card__title-row">
            <span className="res-card__title-icon" aria-hidden="true">
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

            <h3 className="res-card__title">{reservation.nom_pista}</h3>
          </div>

          <p className="res-card__subtitle">
            Consulta el detall i gestiona la teva reserva
          </p>
        </div>

        <div className="res-card__header-actions">
          {!isActive && (
            <button
              type="button"
              onClick={() => onDeleteCancelled(reservation.id)}
              disabled={isDeletingCancelled}
              title="Eliminar reserva cancel·lada"
              aria-label="Eliminar reserva cancel·lada"
              className={`res-card__delete-icon-button ${
                isDeletingCancelled
                  ? "res-card__delete-icon-button--disabled"
                  : ""
              }`}
            >
              {isDeletingCancelled ? (
                <span className="res-card__delete-loading-dots">···</span>
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
            className={`res-card__badge ${
              isActive ? "res-card__badge--active" : "res-card__badge--inactive"
            }`}
          >
            <span
              className={`res-card__badge-dot ${
                isActive
                  ? "res-card__badge-dot--active"
                  : "res-card__badge-dot--inactive"
              }`}
            />
            {reservation.estat}
          </span>
        </div>
      </div>

      <div className="res-card__quick-meta">
        <div className="res-card__quick-pill">
          <span className="res-card__quick-label">Data</span>
          <span className="res-card__quick-value">{formattedDate}</span>
        </div>

        <div className="res-card__quick-pill">
          <span className="res-card__quick-label">Hora</span>
          <span className="res-card__quick-value">
            {reservation.hora_inici} - {reservation.hora_fi}
          </span>
        </div>

        <div className="res-card__quick-pill res-card__quick-pill--price">
          <span className="res-card__quick-label">Import</span>
          <span className="res-card__quick-value">
            {reservation.preu_total != null
              ? `${Number(reservation.preu_total).toFixed(2)} €`
              : reservation.preu != null
                ? `${Number(reservation.preu).toFixed(2)} €`
                : "No disponible"}
          </span>
        </div>
      </div>

      <div className="res-card__info-grid res-card__info-grid--compact">
        <div className="res-card__info-box">
          <span className="res-card__label">Codi reserva</span>
          <p className="res-card__value">
            {reservation.codi_reserva || "No disponible"}
          </p>
        </div>

        <div className="res-card__info-box">
          <span className="res-card__label">Pagament</span>
          <div className="res-card__value-badge-row">
            <span className={paymentMethodBadgeClass(reservation.metode_pagament)}>
              {paymentMethodLabel(reservation.metode_pagament)}
            </span>
          </div>
        </div>

        <div className="res-card__info-box">
          <span className="res-card__label">Estat pagament</span>
          <div className="res-card__value-badge-row">
            <span className={paymentStatusBadgeClass(reservation.estat_pagament)}>
              {paymentStatusLabel(reservation.estat_pagament)}
            </span>
          </div>
        </div>
      </div>

      {isActive && !confirmingCancel && (
        <div className="res-card__footer">
          <button
            type="button"
            className={`btn btn-sm res-card__cancel-button ${
              isCancelling ? "res-card__cancel-button--disabled" : ""
            }`}
            onClick={() => onStartCancel(reservation.id)}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancel·lant..." : "Cancel·lar reserva"}
          </button>
        </div>
      )}

      {isActive && confirmingCancel && (
        <div className="scale-in res-card__confirm-box">
          <p className="res-card__confirm-title">Confirmar cancel·lació</p>

          <p className="res-card__confirm-text">
            Segur que vols cancel·lar aquesta reserva de{" "}
            <strong>{reservation.nom_pista}</strong>?
          </p>

          <div className="res-card__confirm-actions">
            <button
              type="button"
              className={`btn btn-sm res-card__confirm-danger-button ${
                isCancelling ? "res-card__confirm-danger-button--loading" : ""
              }`}
              onClick={() => onCancel(reservation.id)}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancel·lant..." : "Sí, cancel·lar"}
            </button>

            <button
              type="button"
              className={`btn btn-light btn-sm res-card__confirm-secondary-button ${
                isCancelling
                  ? "res-card__confirm-secondary-button--disabled"
                  : ""
              }`}
              onClick={onAbortCancel}
              disabled={isCancelling}
            >
              Mantenir reserva
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default ReservationCard;