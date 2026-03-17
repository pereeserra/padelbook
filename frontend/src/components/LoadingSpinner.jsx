function LoadingSpinner({
  text = "Carregant dades...",
  minHeight = "220px",
  compact = false,
}) {
  return (
    <div
      style={{
        ...styles.wrapper,
        minHeight,
        ...(compact ? styles.wrapperCompact : {}),
      }}
      role="status"
      aria-live="polite"
    >
      <div style={styles.spinner} />
      <p style={styles.text}>{text}</p>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "2rem 1.5rem",
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
    marginTop: "1.5rem",
  },
  wrapperCompact: {
    padding: "1.5rem 1rem",
    borderRadius: "14px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "4px solid #dbeafe",
    borderTop: "4px solid #2563eb",
    animation: "padelbookSpin 0.8s linear infinite",
  },
  text: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
};

export default LoadingSpinner;