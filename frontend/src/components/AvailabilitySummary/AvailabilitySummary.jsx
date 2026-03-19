import "./AvailabilitySummary.css";

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
    <section className="fade-in-up delay-1 avail-summary__section">
      <div className="avail-summary__header">
        <div>
          <span className="avail-summary__kicker">Vista resumida</span>
          <h2 className="avail-summary__title">Resum per pistes</h2>
          <p className="avail-summary__subtitle">
            Una lectura ràpida de quantes franges tens lliures i ocupades a cada pista.
          </p>
        </div>
      </div>

      <div className="avail-summary__grid">
        {courts.map((court) => {
          const percentage =
            court.total > 0 ? Math.round((court.available / court.total) * 100) : 0;

          return (
            <article key={court.name} className="avail-summary__card">
              <div className="avail-summary__card-top">
                <h3 className="avail-summary__card-title">{court.name}</h3>
                <span className="avail-summary__percentage-badge">{percentage}% lliure</span>
              </div>

              <div className="avail-summary__stats-row">
                <span className="avail-summary__total-badge">{court.total} franges</span>
                <span className="avail-summary__available-badge">{court.available} lliures</span>
                <span className="avail-summary__occupied-badge">{court.occupied} ocupades</span>
              </div>

              <div className="avail-summary__progress-track">
                <div
                  className="avail-summary__progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AvailabilitySummary;