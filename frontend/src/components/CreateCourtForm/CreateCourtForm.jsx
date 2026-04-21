import "./CreateCourtForm.css";

function CreateCourtForm({
  newCourt,
  setNewCourt,
  onSubmit,
  creatingCourt = false,
  isEditing = false,
  onCancelEdit,
}) {
  const updateField = (field, value) => {
    setNewCourt({
      ...newCourt,
      [field]: value,
    });
  };

  const cleanName = (newCourt.nom_pista || "").trim();
  const cleanDescription = (newCourt.descripcio || "").trim();

  // Resum de les dades clau per mostrar a la part superior del formulari i reforçar la informació principal de la pista
  const formSummary = [
    {
      label: "Nom de la pista",
      value: cleanName || "Sense nom",
    },
    {
      label: "Tipus",
      value: newCourt.tipus === "dobles" ? "Dobles" : "Individual",
    },
    {
      label: "Modalitat",
      value: Number(newCourt.coberta) === 1 ? "Indoor" : "Outdoor",
    },
    {
      label: "Estat",
      value: newCourt.estat === "disponible" ? "Disponible" : "Manteniment",
    },
    {
      label: "Preu/persona 1h",
      value:
        newCourt.preu_persona_1h !== undefined &&
        newCourt.preu_persona_1h !== null &&
        newCourt.preu_persona_1h !== ""
          ? `${Number(newCourt.preu_persona_1h).toFixed(2)} €`
          : "No definit",
    },
    {
      label: "Preu/persona 1h30",
      value:
        newCourt.preu_persona_1h30 !== undefined &&
        newCourt.preu_persona_1h30 !== null &&
        newCourt.preu_persona_1h30 !== ""
          ? `${Number(newCourt.preu_persona_1h30).toFixed(2)} €`
          : "No definit",
    },
  ];

  return (
    <form onSubmit={onSubmit} className="court-form__wrapper">
      <div className="court-form__top-panel">
        <div className="court-form__top-panel-content">
          <span
            className={`court-form__mode-badge ${
              isEditing ? "court-form__mode-badge--edit" : "court-form__mode-badge--create"
            }`}
          >
            {isEditing ? "Mode edició" : "Nova pista"}
          </span>

          <h3 className="court-form__top-panel-title">
            {isEditing ? "Actualitzar informació de la pista" : "Alta de nova pista"}
          </h3>

          <p className="court-form__top-panel-text">
            {isEditing
              ? "Revisa les dades actuals i guarda només quan la informació sigui correcta."
              : "Defineix les dades bàsiques de la pista perquè quedi disponible dins el sistema."}
          </p>
        </div>

        <div className="court-form__top-panel-summary">
          {formSummary.map((item) => (
            <div key={item.label} className="court-form__summary-item">
              <span className="court-form__summary-label">{item.label}</span>
              <span className="court-form__summary-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="court-form__form-grid">
        <div className="court-form__field">
          <label htmlFor="nom_pista" className="court-form__label">
            Nom de la pista
          </label>
          <input
            id="nom_pista"
            type="text"
            placeholder="Ex: Pista 4"
            value={newCourt.nom_pista}
            onChange={(e) => updateField("nom_pista", e.target.value)}
            className="court-form__input"
            required
          />
          <span className="court-form__helper-text">
            Usa un nom curt i fàcil d'identificar.
          </span>
        </div>

        <div className="court-form__field">
          <label htmlFor="tipus" className="court-form__label">
            Tipus
          </label>
          <select
            id="tipus"
            value={newCourt.tipus}
            onChange={(e) => updateField("tipus", e.target.value)}
            className="court-form__input"
          >
            <option value="dobles">Dobles</option>
            <option value="individual">Individual</option>
          </select>
          <span className="court-form__helper-text">
            Determina el format principal de joc.
          </span>
        </div>

        <div className="court-form__field">
          <label htmlFor="coberta" className="court-form__label">
            Modalitat
          </label>
          <select
            id="coberta"
            value={newCourt.coberta}
            onChange={(e) => updateField("coberta", e.target.value)}
            className="court-form__input"
          >
            <option value={1}>Indoor</option>
            <option value={0}>Outdoor</option>
          </select>
          <span className="court-form__helper-text">
            Indica si està protegida o a l'aire lliure.
          </span>
        </div>

        <div className="court-form__field">
          <label htmlFor="estat" className="court-form__label">
            Estat
          </label>
          <select
            id="estat"
            value={newCourt.estat}
            onChange={(e) => updateField("estat", e.target.value)}
            className="court-form__input"
          >
            <option value="disponible">Disponible</option>
            <option value="manteniment">Manteniment</option>
          </select>
          <span className="court-form__helper-text">
            Marca si la pista es pot reservar ara mateix.
          </span>
        </div>

        <div className="court-form__field">
          <label htmlFor="preu_persona_1h" className="court-form__label">
            Preu per persona (1h) (€)
          </label>
          <input
            id="preu_persona_1h"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex: 5.00"
            value={newCourt.preu_persona_1h || ""}
            onChange={(e) => updateField("preu_persona_1h", e.target.value)}
            className="court-form__input"
          />
          <span className="court-form__helper-text">
            Opcional. Import que pagarà cada jugador si la reserva dura 1 hora.
          </span>
        </div>

        <div className="court-form__field">
          <label htmlFor="preu_persona_1h30" className="court-form__label">
            Preu per persona (1h30) (€)
          </label>
          <input
            id="preu_persona_1h30"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex: 7.50"
            value={newCourt.preu_persona_1h30 || ""}
            onChange={(e) => updateField("preu_persona_1h30", e.target.value)}
            className="court-form__input"
          />
          <span className="court-form__helper-text">
            Opcional. Import que pagarà cada jugador si la reserva dura 1h30.
          </span>
        </div>

        <div className="court-form__field court-form__field--full">
          <label htmlFor="descripcio" className="court-form__label">
            Descripció
          </label>
          <textarea
            id="descripcio"
            placeholder="Afegeix informació útil sobre la pista..."
            value={newCourt.descripcio}
            onChange={(e) => updateField("descripcio", e.target.value)}
            className="court-form__textarea"
            rows={4}
          />
          <span className="court-form__helper-text">
            Pots indicar detalls com orientació, estat del terra o observacions útils.
          </span>
        </div>
      </div>

      <div className="court-form__preview-panel">
        <div className="court-form__preview-header">
          <span className="court-form__preview-kicker">Vista ràpida</span>
          <span
            className={`court-form__preview-status ${
              newCourt.estat === "disponible"
                ? "court-form__preview-status--available"
                : "court-form__preview-status--maintenance"
            }`}
          >
            {newCourt.estat === "disponible" ? "Disponible" : "Manteniment"}
          </span>
        </div>

        <h4 className="court-form__preview-title">
          {cleanName || "Nom pendent de definir"}
        </h4>

        <div className="court-form__preview-badges">
          <span className="court-form__preview-badge">
            {newCourt.tipus === "dobles" ? "Dobles" : "Individual"}
          </span>

          <span
            className={`court-form__preview-badge ${
              Number(newCourt.coberta) === 1
                ? "court-form__preview-badge--covered"
                : "court-form__preview-badge--outdoor"
            }`}
          >
            {Number(newCourt.coberta) === 1 ? "Indoor" : "Outdoor"}
          </span>
        </div>

        <p className="court-form__preview-description">
          {cleanDescription || "La descripció de la pista encara no s'ha indicat."}
        </p>
      </div>

      <div className="court-form__info-panel">
        <span className="court-form__info-panel-title">
          {isEditing ? "Revisió abans de guardar" : "Consell de configuració"}
        </span>
        <p className="court-form__info-panel-text">
          {isEditing
            ? "Confirma sobretot l'estat de la pista i la descripció abans de desar els canvis."
            : "Intenta mantenir una nomenclatura consistent entre pistes per facilitar la gestió."}
        </p>
      </div>

      <div className="court-form__actions">
        {isEditing && (
          <button
            type="button"
            className="btn btn-light"
            onClick={onCancelEdit}
            disabled={creatingCourt}
          >
            Cancel·lar edició
          </button>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={creatingCourt}
        >
          {creatingCourt
            ? isEditing
              ? "Guardant canvis..."
              : "Creant pista..."
            : isEditing
            ? "Guardar canvis"
            : "Crear pista"}
        </button>
      </div>
    </form>
  );
}

export default CreateCourtForm;