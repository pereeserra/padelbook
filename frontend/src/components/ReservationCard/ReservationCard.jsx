import { useEffect, useRef } from "react";
import "./ReservationCard.css";

function ReservationCard({
  reservation,
  onCancel,
  onDeleteCancelled,
  onRepeatReservation,
  isCancelling = false,
  isDeletingCancelled = false,
  confirmingCancel = false,
  onStartCancel,
  onAbortCancel,
}) {
  const isActive = reservation.estat === "activa";

  const getReservationEndDate = () => {
    const baseDate = new Date(reservation.data_reserva);

    const [hours, minutes, seconds = 0] = String(reservation.hora_fi || "00:00:00")
      .split(":")
      .map(Number);

    const endDate = new Date(baseDate);
    endDate.setHours(hours, minutes, seconds, 0);

    return endDate;
  };

  const isPastReservation = getReservationEndDate() < new Date();
  const cardRef = useRef(null);

  const reservationDateObj = new Date(reservation.data_reserva);
  const today = new Date();
  const isTodayReservation =
    reservationDateObj.toDateString() === today.toDateString();

  const temporalStatusLabel =
    reservation.estat === "cancel·lada"
      ? "Cancel·lada"
      : isPastReservation
      ? "Finalitzada"
      : isTodayReservation
      ? "Avui"
      : "Pròxima";

  // Funció per fer scroll suau cap a la targeta quan s'està confirmant la cancel·lació
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

  // Quan comenci la confirmació de cancel·lació, fem scroll suau cap a la targeta després
  useEffect(() => {
    if (!confirmingCancel) return;

    const timeout = setTimeout(() => {
      slowScrollToCard();
    }, 180);

    return () => clearTimeout(timeout);
  }, [confirmingCancel]);

  // Formatejar la data de reserva en un format llegible en català
  const formattedDate = new Date(reservation.data_reserva).toLocaleDateString(
    "ca-ES",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  // Construir la classe CSS de la targeta en funció de l'estat i les accions en curs
  const cardClass = [
    "res-card",
    confirmingCancel ? "res-card--confirming" : "",
    !isActive ? "res-card--inactive" : "",
    isPastReservation ? "res-card--past" : "",
    isCancelling || isDeletingCancelled ? "res-card--busy" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Determinar el preu a mostrar, prioritzant preu_total sobre preu, i formatar-lo correctament
  const reservationPrice =
    reservation.preu_total != null
      ? `${Number(reservation.preu_total).toFixed(2)} €`
      : reservation.preu != null
        ? `${Number(reservation.preu).toFixed(2)} €`
        : "No disponible";

  return (
    <article ref={cardRef} className={cardClass}>
      <div className="res-card__meta-strip">
        <span className="res-card__meta-code">
          Codi: {reservation.codi_reserva || "No disponible"}
        </span>

        <span
          className={`res-card__meta-status ${
            reservation.estat === "cancel·lada"
              ? "res-card__meta-status--cancelled"
              : isPastReservation
              ? "res-card__meta-status--past"
              : isTodayReservation
              ? "res-card__meta-status--today"
              : "res-card__meta-status--upcoming"
          }`}
        >
          {temporalStatusLabel}
        </span>
      </div>
      <div className="res-card__header">
        <div className="res-card__header-main">
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
        </div>

        <div className="res-card__header-actions">
          {reservation.estat === "cancel·lada" && (
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
              isPastReservation
                ? "res-card__badge--past"
                : isActive
                  ? "res-card__badge--active"
                  : "res-card__badge--inactive"
            }`}
          >
            <span
              className={`res-card__badge-dot ${
                isActive
                  ? "res-card__badge-dot--active"
                  : "res-card__badge-dot--inactive"
              }`}
            />
            {
              reservation.estat === "cancel·lada"
                ? "cancel·lada"
                : isPastReservation
                  ? "finalitzada"
                  : reservation.estat
            }
          </span>
        </div>
      </div>

            <div className="res-card__main-info">
              <div className="res-card__main-row">
                <span className="res-card__main-label">Data</span>
                <span className="res-card__main-value">{formattedDate}</span>
              </div>

              <div className="res-card__main-row">
                <span className="res-card__main-label">Hora</span>
                <span className="res-card__main-value">
                  {reservation.hora_inici?.slice(0, 5)} - {reservation.hora_fi?.slice(0, 5)}
                </span>
              </div>

              <div className="res-card__main-row">
                <span className="res-card__main-label">Pagament</span>
                <span
                  className={`res-card__payment-badge ${
                    reservation.metode_pagament === "online_simulat"
                      ? "res-card__payment-badge--online"
                      : "res-card__payment-badge--club"
                  }`}
                >
                  {reservation.metode_pagament === "online_simulat"
                    ? "Online"
                    : reservation.metode_pagament === "al_club"
                      ? "Al club"
                      : "No disponible"}
                </span>
              </div>

              <div className="res-card__main-row res-card__main-row--price">
                <span className="res-card__main-label">Import</span>
                <span className="res-card__main-price">{reservationPrice}</span>
              </div>
            </div>

      {(isPastReservation || reservation.estat === "cancel·lada") && (
        <div className="res-card__footer res-card__footer--past">
          <button
            type="button"
            className="btn btn-light btn-sm res-card__repeat-button"
            onClick={() => onRepeatReservation(reservation)}
          >
            Tornar a reservar
          </button>
        </div>
      )}

      {isActive && !confirmingCancel && !isPastReservation && (
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