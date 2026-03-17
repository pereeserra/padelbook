import { useMemo, useState } from "react";

function AdminReservationsTable({ reservations = [] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("totes");

  const normalizedReservations = useMemo(() => {
    return [...reservations].sort((a, b) => {
      const dateA = new Date(`${a.data_reserva || ""}T${a.hora_inici || "00:00"}`).getTime();
      const dateB = new Date(`${b.data_reserva || ""}T${b.hora_inici || "00:00"}`).getTime();
      return dateB - dateA;
    });
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedReservations.filter((reservation) => {
      const userName = (reservation.nom_usuari || "").toLowerCase();
      const email = (reservation.email || "").toLowerCase();
      const courtName = (reservation.nom_pista || "").toLowerCase();
      const status = (reservation.estat || "").toLowerCase();

      const matchesSearch =
        !query ||
        userName.includes(query) ||
        email.includes(query) ||
        courtName.includes(query);

      const matchesStatus =
        statusFilter === "totes" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [normalizedReservations, search, statusFilter]);

  const activeCount = useMemo(() => {
    return reservations.filter((reservation) => {
      const status = (reservation.estat || "").toLowerCase();
      return status === "activa" || status === "active";
    }).length;
  }, [reservations]);

  const cancelledCount = useMemo(() => {
    return reservations.filter((reservation) => {
      const status = (reservation.estat || "").toLowerCase();
      return status !== "activa" && status !== "active";
    }).length;
  }, [reservations]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("totes");
  };

  if (!reservations.length) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>📋</span>
        <h3 style={styles.emptyTitle}>No hi ha reserves registrades</h3>
        <p style={styles.emptyText}>
          Quan els usuaris facin reserves, apareixeran aquí perquè les puguis
          consultar des del panell d'administració.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.tableHeader}>
        <div>
          <span style={styles.eyebrow}>Control administratiu</span>
          <h3 style={styles.title}>Reserves registrades</h3>
          <p style={styles.subtitle}>
            Vista general de totes les reserves creades al sistema, amb filtres
            ràpids per revisar-les millor.
          </p>
        </div>

        <span style={styles.countBadge}>{filteredReservations.length} visibles</span>
      </div>

      <div style={styles.summaryGrid}>
        <article style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Totals</span>
          <span style={styles.summaryValue}>{reservations.length}</span>
        </article>

        <article style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Actives</span>
          <span style={styles.summaryValue}>{activeCount}</span>
        </article>

        <article style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Cancel·lades</span>
          <span style={styles.summaryValue}>{cancelledCount}</span>
        </article>

        <article style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Mostrades</span>
          <span style={styles.summaryValue}>{filteredReservations.length}</span>
        </article>
      </div>

      <div style={styles.toolsGrid}>
        <div style={styles.field}>
          <label htmlFor="reservationSearch" style={styles.label}>
            Cercar reserva
          </label>
          <input
            id="reservationSearch"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Usuari, correu o pista..."
            className="pb-input"
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="reservationStatus" style={styles.label}>
            Estat
          </label>
          <select
            id="reservationStatus"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pb-input"
          >
            <option value="totes">Totes</option>
            <option value="activa">Actives</option>
            <option value="cancelada">Cancel·lades</option>
          </select>
        </div>

        <div style={styles.fieldAction}>
          <button
            type="button"
            className="btn btn-light"
            onClick={clearFilters}
          >
            Netejar filtres
          </button>
        </div>
      </div>

      {filteredReservations.length > 0 ? (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Usuari</th>
                <th style={styles.th}>Correu</th>
                <th style={styles.th}>Pista</th>
                <th style={styles.th}>Data</th>
                <th style={styles.th}>Hora</th>
                <th style={styles.th}>Estat</th>
              </tr>
            </thead>

            <tbody>
              {filteredReservations.map((reservation, index) => {
                const formattedDate = new Date(
                  reservation.data_reserva
                ).toLocaleDateString("ca-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                const isActive =
                  (reservation.estat || "").toLowerCase() === "activa" ||
                  (reservation.estat || "").toLowerCase() === "active";

                return (
                  <tr
                    key={reservation.id}
                    style={{
                      ...styles.row,
                      ...(index % 2 === 0 ? styles.rowEven : styles.rowOdd),
                    }}
                  >
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <span style={styles.userAvatar}>
                          {(reservation.nom_usuari || "U").charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p style={styles.primaryText}>
                            {reservation.nom_usuari || "Usuari"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.secondaryText}>
                        {reservation.email || "-"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.primaryText}>
                        {reservation.nom_pista || "-"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.secondaryText}>{formattedDate}</span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.timeBadge}>
                        {reservation.hora_inici} - {reservation.hora_fi}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(isActive
                            ? styles.statusActive
                            : styles.statusInactive),
                        }}
                      >
                        {reservation.estat}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.emptyFilteredState}>
          <p style={styles.emptyFilteredTitle}>No s'ha trobat cap reserva</p>
          <p style={styles.emptyFilteredText}>
            Ajusta la cerca o l’estat seleccionat per tornar a veure resultats.
          </p>

          <button
            type="button"
            className="btn btn-light"
            onClick={clearFilters}
          >
            Mostrar totes les reserves
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
  },
  eyebrow: {
    display: "inline-block",
    marginBottom: "0.35rem",
    fontSize: "0.78rem",
    color: "#64748b",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: "0.35rem",
    marginBottom: 0,
    color: "#64748b",
    lineHeight: 1.6,
  },
  countBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.9rem",
    border: "1px solid #dbeafe",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "0.85rem",
  },
  summaryCard: {
    borderRadius: "18px",
    padding: "0.95rem 1rem",
    background: "linear-gradient(180deg, #f8fafc, #ffffff)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
  },
  summaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "0.78rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "0.35rem",
  },
  summaryValue: {
    color: "#0f172a",
    fontSize: "1.25rem",
    fontWeight: "800",
  },
  toolsGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(200px, 0.7fr) auto",
    gap: "0.85rem",
    alignItems: "end",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  fieldAction: {
    display: "flex",
    alignItems: "end",
  },
  label: {
    fontSize: "0.88rem",
    fontWeight: "800",
    color: "#334155",
  },
  tableContainer: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "22px",
    boxShadow: "0 16px 34px rgba(15,23,42,0.05)",
    backdropFilter: "blur(10px)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
    background: "rgba(255,255,255,0.9)",
  },
  th: {
    textAlign: "left",
    padding: "1rem",
    background: "#f8fbff",
    color: "#334155",
    fontSize: "0.9rem",
    fontWeight: "800",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "1rem",
    borderBottom: "1px solid #eef2f7",
    verticalAlign: "middle",
  },
  row: {
    transition: "background-color 0.2s ease",
  },
  rowEven: {
    background: "rgba(255,255,255,0.96)",
  },
  rowOdd: {
    background: "rgba(248,250,252,0.9)",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0,
    border: "1px solid #bfdbfe",
  },
  primaryText: {
    margin: 0,
    fontWeight: "700",
    color: "#0f172a",
  },
  secondaryText: {
    color: "#475569",
    fontWeight: "600",
  },
  timeBadge: {
    display: "inline-block",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "0.4rem 0.7rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.84rem",
    whiteSpace: "nowrap",
    border: "1px solid #dbeafe",
  },
  statusBadge: {
    display: "inline-block",
    padding: "0.42rem 0.75rem",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.84rem",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
    border: "1px solid transparent",
  },
  statusActive: {
    background: "#ecfdf5",
    color: "#15803d",
    borderColor: "#bbf7d0",
  },
  statusInactive: {
    background: "#fff1f2",
    color: "#be123c",
    borderColor: "#fecdd3",
  },
  emptyState: {
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "24px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 18px 40px rgba(15,23,42,0.05)",
    backdropFilter: "blur(10px)",
  },
  emptyIcon: {
    fontSize: "2rem",
    display: "inline-block",
    marginBottom: "0.75rem",
  },
  emptyTitle: {
    marginTop: 0,
    marginBottom: "0.5rem",
    color: "#0f172a",
  },
  emptyText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.7,
  },
  emptyFilteredState: {
    borderRadius: "20px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "#f8fafc",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    alignItems: "flex-start",
  },
  emptyFilteredTitle: {
    margin: 0,
    color: "#0f172a",
    fontWeight: "800",
    fontSize: "1rem",
  },
  emptyFilteredText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.65,
  },
};

export default AdminReservationsTable;