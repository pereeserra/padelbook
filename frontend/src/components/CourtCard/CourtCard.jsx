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

  const shortDescription = (court.descripcio || "").trim();
  const fallbackDescription = "Sense descripció definida.";

  // Construir la classe del card amb condicions per estils especials
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
          <p className="court-card__subtitle">
            Gestió ràpida de la pista i del seu estat actual.
          </p>
        </div>
      </div>

      <div className="court-card__meta-grid">
        <div className="court-card__meta-item">
          <span className="court-card__meta-label">Tipus</span>
          <span className="court-card__meta-value">{courtTypeLabel}</span>
        </div>

        <div className="court-card__meta-item">
          <span className="court-card__meta-label">Modalitat</span>
          <span className="court-card__meta-value">{courtModeLabel}</span>
        </div>

        <div className="court-card__meta-item">
          <span className="court-card__meta-label">Preu 1h</span>
          <span className="court-card__meta-value">
            {court.preu_persona_1h !== undefined &&
            court.preu_persona_1h !== null &&
            court.preu_persona_1h !== ""
              ? `${Number(court.preu_persona_1h).toFixed(2)} €`
              : "No definit"}
          </span>
        </div>

        <div className="court-card__meta-item">
          <span className="court-card__meta-label">Preu 1h30</span>
          <span className="court-card__meta-value">
            {court.preu_persona_1h30 !== undefined &&
            court.preu_persona_1h30 !== null &&
            court.preu_persona_1h30 !== ""
              ? `${Number(court.preu_persona_1h30).toFixed(2)} €`
              : "No definit"}
          </span>
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
          {shortDescription || fallbackDescription}
        </p>
      </div>

      {!confirmingDelete && (
        <div className="court-card__footer">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onEdit}
          >
            Editar
          </button>

          <button
            type="button"
            className="btn btn-sm court-card__delete-button"
            onClick={onStartDelete}
          >
            Eliminar
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