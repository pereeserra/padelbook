function AvailabilitySummary({ availability }) {
  if (!availability.length) return null;

  const groupedCourts = availability.reduce((acc, slot) => {
    const courtName = slot.nom_pista;

    if (!acc[courtName]) {
      acc[courtName] = {
        name: courtName,
        total: 0,
        available: 0,
        occupied: 0,
      };
    }

    acc[courtName].total += 1;

    if (slot.disponible) {
      acc[courtName].available += 1;
    } else {
      acc[courtName].occupied += 1;
    }

    return acc;
  }, {});

  const extractCourtNumber = (name) => {
    const match = name.match(/\d+/);
    return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
  };

  const courts = Object.values(groupedCourts).sort((a, b) => {
    const numberA = extractCourtNumber(a.name);
    const numberB = extractCourtNumber(b.name);

    if (numberA !== numberB) {
      return numberA - numberB;
    }

    return a.name.localeCompare(b.name, "ca");
  });

  return (
    <section className="fade-in-up delay-1" style={styles.section}>
      <div style={styles.header}>
        <div>
          <span style={styles.kicker}>Vista resumida</span>
          <h2 style={styles.title}>Resum per pistes</h2>
          <p style={styles.subtitle}>
            Una lectura ràpida de quantes franges tens lliures i ocupades a cada pista.
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        {courts.map((court) => {
          const percentage =
            court.total > 0 ? Math.round((court.available / court.total) * 100) : 0;

          return (
            <article key={court.name} style={styles.card}>
              <div style={styles.cardTop}>
                <h3 style={styles.cardTitle}>{court.name}</h3>
                <span style={styles.percentageBadge}>{percentage}% lliure</span>
              </div>

              <div style={styles.statsRow}>
                <span style={styles.totalBadge}>{court.total} franges</span>
                <span style={styles.availableBadge}>{court.available} lliures</span>
                <span style={styles.occupiedBadge}>{court.occupied} ocupades</span>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  section: {
    marginTop: "2rem",
  },
  header: {
    marginBottom: "1rem",
  },
  kicker: {
    display: "inline-block",
    marginBottom: "0.7rem",
    padding: "0.42rem 0.75rem",
    borderRadius: "999px",
    background: "rgba(37,99,235,0.08)",
    color: "#1d4ed8",
    fontWeight: "800",
    fontSize: "0.8rem",
  },
  title: {
    margin: 0,
    fontSize: "1.9rem",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: "0.4rem",
    marginBottom: 0,
    color: "#64748b",
    lineHeight: 1.65,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem",
  },
  card: {
    background: "rgba(255,255,255,0.84)",
    borderRadius: "24px",
    padding: "1.15rem",
    boxShadow: "0 16px 34px rgba(15,23,42,0.05)",
    border: "1px solid rgba(148,163,184,0.18)",
    backdropFilter: "blur(10px)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.8rem",
    marginBottom: "0.9rem",
    flexWrap: "wrap",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.15rem",
    color: "#0f172a",
  },
  percentageBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "0.35rem 0.7rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.82rem",
    border: "1px solid #dbeafe",
  },
  statsRow: {
    display: "flex",
    gap: "0.45rem",
    flexWrap: "wrap",
    marginBottom: "0.95rem",
  },
  totalBadge: {
    background: "#f8fafc",
    color: "#475569",
    padding: "0.3rem 0.6rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.8rem",
    border: "1px solid #e2e8f0",
  },
  availableBadge: {
    background: "#ecfdf5",
    color: "#15803d",
    padding: "0.3rem 0.6rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.8rem",
    border: "1px solid #bbf7d0",
  },
  occupiedBadge: {
    background: "#fff1f2",
    color: "#be123c",
    padding: "0.3rem 0.6rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.8rem",
    border: "1px solid #fecdd3",
  },
  progressTrack: {
    width: "100%",
    height: "11px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #16a34a, #22c55e)",
    borderRadius: "999px",
  },
};

export default AvailabilitySummary;