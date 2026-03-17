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
    <section style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.title}>Resum per pistes</h2>
        <p style={styles.subtitle}>
          Vista ràpida de l’estat de cada pista per al dia seleccionat.
        </p>
      </div>

      <div style={styles.grid}>
        {courts.map((court) => {
          const percentage =
            court.total > 0 ? Math.round((court.available / court.total) * 100) : 0;

          return (
            <div key={court.name} style={styles.card}>
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
            </div>
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
  title: {
    margin: 0,
    fontSize: "1.8rem",
  },
  subtitle: {
    marginTop: "0.4rem",
    marginBottom: 0,
    color: "#64748b",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "1.1rem",
    boxShadow: "0 8px 22px rgba(0,0,0,0.07)",
    border: "1px solid #e5e7eb",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.8rem",
    marginBottom: "0.85rem",
    flexWrap: "wrap",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.15rem",
  },
  percentageBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    padding: "0.35rem 0.7rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.85rem",
  },
  statsRow: {
    display: "flex",
    gap: "0.45rem",
    flexWrap: "wrap",
    marginBottom: "0.9rem",
  },
  totalBadge: {
    backgroundColor: "#e2e8f0",
    color: "#334155",
    padding: "0.3rem 0.6rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.8rem",
  },
  availableBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "0.3rem 0.6rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.8rem",
  },
  occupiedBadge: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "0.3rem 0.6rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.8rem",
  },
  progressTrack: {
    width: "100%",
    height: "10px",
    backgroundColor: "#e5e7eb",
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