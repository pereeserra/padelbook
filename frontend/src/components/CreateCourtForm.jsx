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

  return (
    <form onSubmit={onSubmit} style={styles.form}>
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
  form: {
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
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#1e293b",
  },
  input: {
    width: "100%",
    padding: "0.95rem 1rem",
    fontSize: "1rem",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  textarea: {
    width: "100%",
    padding: "0.95rem 1rem",
    fontSize: "1rem",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    resize: "vertical",
    fontFamily: "Arial, sans-serif",
  },
  actions: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "0.25rem",
    flexWrap: "wrap",
  },
};

export default CreateCourtForm;