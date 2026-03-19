import "./CourtCard.css";

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

  const cardClass = [
    "court-card",
    confirmingDelete ? "court-card--confirming" : "",
    isHighlighted ? "court-card--highlighted" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article id={`court-${court.id}`} className={cardClass}>
      <div className="court-card__top-bar">
        <span className="court-card__eyebrow">Pista #{court.id}</span>

        <span
          className={`court-card__status-badge ${
            isAvailable
              ? "court-card__status-badge--available"
              : "court-card__status-badge--maintenance"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="court-card__header">
        <div className="court-card__identity-block">
          <h3 className="court-card__title">{court.nom_pista}</h3>
          <p className="court-card__subtitle">Gestió individual i estat actual de la pista</p>
        </div>
      </div>

      <div className="court-card__summary-grid">
        <div className="court-card__summary-item">
          <span className="court-card__summary-label">Tipus</span>
          <span className="court-card__summary-value">{courtTypeLabel}</span>
        </div>

        <div className="court-card__summary-item">
          <span className="court-card__summary-label">Modalitat</span>
          <span className="court-card__summary-value">{courtModeLabel}</span>
        </div>
      </div>

      <div className="court-card__badges-row">
        <span className="court-card__info-badge">{courtTypeLabel}</span>

        <span
          className={`court-card__info-badge ${
            isCovered
              ? "court-card__info-badge--covered"
              : "court-card__info-badge--outdoor"
          }`}
        >
          {courtModeLabel}
        </span>
      </div>

      <div className="court-card__description-box">
        <span className="court-card__description-label">Descripció</span>
        <p className="court-card__description-text">
          {court.descripcio || "Sense descripció."}
        </p>
      </div>

      {!confirmingDelete && (
        <div className="court-card__footer">
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={onEdit}
          >
            Editar pista
          </button>

          <button
            type="button"
            className="btn btn-sm court-card__delete-button"
            onClick={onStartDelete}
          >
            Eliminar pista
          </button>
        </div>
      )}

      {confirmingDelete && (
        <div className="scale-in court-card__confirm-box">
          <p className="court-card__confirm-title">Confirmar eliminació</p>
          <p className="court-card__confirm-text">
            Segur que vols eliminar la pista <strong>{court.nom_pista}</strong>?
            Aquesta acció no es pot desfer.
          </p>

          <div className="court-card__confirm-actions">
            <button
              type="button"
              className="btn btn-sm court-card__confirm-danger-button"
              onClick={onDelete}
              disabled={isDeleting}
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

export default CourtCard;