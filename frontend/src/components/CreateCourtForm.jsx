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

  const formSummary = [
    {
      label: "Tipus",
      value: newCourt.tipus === "dobles" ? "Dobles" : "Individual",
    },
    {
      label: "Modalitat",
      value: Number(newCourt.coberta) === 1 ? "Coberta" : "Exterior",
    },
    {
      label: "Estat",
      value: newCourt.estat === "disponible" ? "Disponible" : "Manteniment",
    },
  ];

  return (
    <form onSubmit={onSubmit} style={styles.wrapper}>
      <div style={styles.topPanel}>
        <div style={styles.topPanelContent}>
          <span
            style={{
              ...styles.modeBadge,
              ...(isEditing ? styles.modeBadgeEdit : styles.modeBadgeCreate),
            }}
          >
            {isEditing ? "Mode edició" : "Nova pista"}
          </span>

          <h3 style={styles.topPanelTitle}>
            {isEditing ? "Actualitzar informació de la pista" : "Alta de nova pista"}
          </h3>

          <p style={styles.topPanelText}>
            {isEditing
              ? "Revisa les dades actuals i guarda només quan la informació sigui correcta."
              : "Defineix les dades bàsiques de la pista perquè quedi disponible dins el sistema."}
          </p>
        </div>

        <div style={styles.topPanelSummary}>
          {formSummary.map((item) => (
            <div key={item.label} style={styles.summaryItem}>
              <span style={styles.summaryLabel}>{item.label}</span>
              <span style={styles.summaryValue}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.formGrid}>
        <div style={styles.field}>
          <label htmlFor="nom_pista" style={styles.label}>
            Nom de la pista
          </label>
          <input
            id="nom_pista"
            type="text"
            placeholder="Ex: Pista 4"
            value={newCourt.nom_pista}
            onChange={(e) => updateField("nom_pista", e.target.value)}
            style={styles.input}
            required
          />
          <span style={styles.helperText}>
            Usa un nom curt i fàcil d’identificar.
          </span>
        </div>

        <div style={styles.field}>
          <label htmlFor="tipus" style={styles.label}>
            Tipus
          </label>
          <select
            id="tipus"
            value={newCourt.tipus}
            onChange={(e) => updateField("tipus", e.target.value)}
            style={styles.input}
          >
            <option value="dobles">Dobles</option>
            <option value="individual">Individual</option>
          </select>
          <span style={styles.helperText}>
            Determina el format principal de joc.
          </span>
        </div>

        <div style={styles.field}>
          <label htmlFor="coberta" style={styles.label}>
            Modalitat
          </label>
          <select
            id="coberta"
            value={newCourt.coberta}
            onChange={(e) => updateField("coberta", e.target.value)}
            style={styles.input}
          >
            <option value={0}>Exterior</option>
            <option value={1}>Coberta</option>
          </select>
          <span style={styles.helperText}>
            Indica si està protegida o a l’aire lliure.
          </span>
        </div>

        <div style={styles.field}>
          <label htmlFor="estat" style={styles.label}>
            Estat
          </label>
          <select
            id="estat"
            value={newCourt.estat}
            onChange={(e) => updateField("estat", e.target.value)}
            style={styles.input}
          >
            <option value="disponible">Disponible</option>
            <option value="manteniment">Manteniment</option>
          </select>
          <span style={styles.helperText}>
            Marca si la pista es pot reservar ara mateix.
          </span>
        </div>

        <div style={styles.fieldFull}>
          <label htmlFor="descripcio" style={styles.label}>
            Descripció
          </label>
          <textarea
            id="descripcio"
            placeholder="Afegeix informació útil sobre la pista..."
            value={newCourt.descripcio}
            onChange={(e) => updateField("descripcio", e.target.value)}
            style={styles.textarea}
            rows={4}
          />
          <span style={styles.helperText}>
            Pots indicar detalls com orientació, estat del terra o observacions útils.
          </span>
        </div>
      </div>

      <div style={styles.previewPanel}>
        <div style={styles.previewHeader}>
          <span style={styles.previewKicker}>Vista ràpida</span>
          <span
            style={{
              ...styles.previewStatus,
              ...(newCourt.estat === "disponible"
                ? styles.previewStatusAvailable
                : styles.previewStatusMaintenance),
            }}
          >
            {newCourt.estat === "disponible" ? "Disponible" : "Manteniment"}
          </span>
        </div>

        <h4 style={styles.previewTitle}>
          {cleanName || "Nom pendent de definir"}
        </h4>

        <div style={styles.previewBadges}>
          <span style={styles.previewBadge}>
            {newCourt.tipus === "dobles" ? "Dobles" : "Individual"}
          </span>

          <span
            style={{
              ...styles.previewBadge,
              ...(Number(newCourt.coberta) === 1
                ? styles.previewBadgeCovered
                : styles.previewBadgeOutdoor),
            }}
          >
            {Number(newCourt.coberta) === 1 ? "Coberta" : "Exterior"}
          </span>
        </div>

        <p style={styles.previewDescription}>
          {cleanDescription || "La descripció de la pista encara no s’ha indicat."}
        </p>
      </div>

      <div style={styles.infoPanel}>
        <span style={styles.infoPanelTitle}>
          {isEditing ? "Revisió abans de guardar" : "Consell de configuració"}
        </span>
        <p style={styles.infoPanelText}>
          {isEditing
            ? "Confirma sobretot l’estat de la pista i la descripció abans de desar els canvis."
            : "Intenta mantenir una nomenclatura consistent entre pistes per facilitar la gestió."}
        </p>
      </div>

      <div style={styles.actions}>
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

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  topPanel: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(260px, 0.8fr)",
    gap: "1rem",
    padding: "1rem",
    borderRadius: "22px",
    background: "linear-gradient(135deg, #f8fafc, #eff6ff)",
    border: "1px solid #dbeafe",
  },
  topPanelContent: {
    minWidth: 0,
  },
  modeBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "34px",
    padding: "0.35rem 0.85rem",
    borderRadius: "999px",
    fontSize: "0.82rem",
    fontWeight: "800",
    letterSpacing: "0.01em",
    border: "1px solid transparent",
  },
  modeBadgeCreate: {
    background: "#dbeafe",
    color: "#1d4ed8",
    borderColor: "#bfdbfe",
  },
  modeBadgeEdit: {
    background: "#fef3c7",
    color: "#b45309",
    borderColor: "#fde68a",
  },
  topPanelTitle: {
    margin: "0.7rem 0 0 0",
    color: "#0f172a",
    fontSize: "1.35rem",
    fontWeight: "800",
    letterSpacing: "-0.02em",
  },
  topPanelText: {
    margin: "0.5rem 0 0 0",
    color: "#475569",
    lineHeight: 1.7,
  },
  topPanelSummary: {
    display: "grid",
    gap: "0.75rem",
  },
  summaryItem: {
    borderRadius: "18px",
    padding: "0.9rem 1rem",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(148,163,184,0.16)",
    boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
  },
  summaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "0.76rem",
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  fieldFull: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  label: {
    fontSize: "0.94rem",
    fontWeight: "800",
    color: "#1e293b",
  },
  input: {
    width: "100%",
    padding: "1rem 1rem",
    fontSize: "1rem",
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    outline: "none",
    background: "rgba(255,255,255,0.96)",
    color: "#0f172a",
    boxShadow: "0 6px 16px rgba(15,23,42,0.03)",
  },
  textarea: {
    width: "100%",
    padding: "1rem 1rem",
    fontSize: "1rem",
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    outline: "none",
    background: "rgba(255,255,255,0.96)",
    color: "#0f172a",
    boxShadow: "0 6px 16px rgba(15,23,42,0.03)",
    resize: "vertical",
    fontFamily: "Inter, Arial, sans-serif",
    lineHeight: 1.6,
  },
  helperText: {
    color: "#64748b",
    fontSize: "0.84rem",
    fontWeight: "600",
    lineHeight: 1.5,
  },
  previewPanel: {
    borderRadius: "22px",
    padding: "1rem",
    background: "linear-gradient(180deg, #ffffff, #f8fafc)",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.8rem",
    flexWrap: "wrap",
  },
  previewKicker: {
    color: "#64748b",
    fontSize: "0.78rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  previewStatus: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.35rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "800",
    border: "1px solid transparent",
  },
  previewStatusAvailable: {
    background: "#ecfdf5",
    color: "#15803d",
    borderColor: "#bbf7d0",
  },
  previewStatusMaintenance: {
    background: "#fff7ed",
    color: "#c2410c",
    borderColor: "#fdba74",
  },
  previewTitle: {
    margin: "0.7rem 0 0 0",
    color: "#0f172a",
    fontSize: "1.15rem",
    fontWeight: "800",
  },
  previewBadges: {
    display: "flex",
    gap: "0.55rem",
    flexWrap: "wrap",
    marginTop: "0.75rem",
  },
  previewBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "32px",
    padding: "0.35rem 0.8rem",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #dbeafe",
    fontSize: "0.82rem",
    fontWeight: "800",
  },
  previewBadgeCovered: {
    background: "#eefdf4",
    color: "#15803d",
    borderColor: "#bbf7d0",
  },
  previewBadgeOutdoor: {
    background: "#fff7ed",
    color: "#c2410c",
    borderColor: "#fdba74",
  },
  previewDescription: {
    margin: "0.85rem 0 0 0",
    color: "#475569",
    lineHeight: 1.7,
  },
  infoPanel: {
    background: "#f8fbff",
    border: "1px solid #dbeafe",
    borderRadius: "18px",
    padding: "1rem",
  },
  infoPanelTitle: {
    display: "block",
    color: "#1d4ed8",
    fontWeight: "800",
    marginBottom: "0.3rem",
  },
  infoPanelText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.65,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "0.25rem",
    flexWrap: "wrap",
  },
};

export default CreateCourtForm;