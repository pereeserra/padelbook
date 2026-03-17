function LoadingSpinner({
  text = "Carregant dades...",
  minHeight = "220px",
  compact = false,
}) {
  return (
    <section
      className={`pb-loading-shell ${compact ? "pb-loading-shell--compact" : ""}`}
      style={{ minHeight }}
      role="status"
      aria-live="polite"
    >
      <div className="pb-loading-orb">
        <div className="pb-loading-ring" />
        <div className="pb-loading-ring pb-loading-ring--delay" />
        <div className="pb-loading-core" />
      </div>

      <div className="pb-loading-content">
        <span className="pb-loading-badge">PadelBook</span>
        <p className="pb-loading-text">{text}</p>
      </div>
    </section>
  );
}

export default LoadingSpinner;