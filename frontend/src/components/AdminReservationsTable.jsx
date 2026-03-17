function AdminReservationsTable({ reservations = [] }) {
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
          <h3 style={styles.title}>Reserves registrades</h3>
          <p style={styles.subtitle}>
            Vista general de totes les reserves creades al sistema.
          </p>
        </div>

        <span style={styles.countBadge}>{reservations.length} reserves</span>
      </div>

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
            {reservations.map((reservation, index) => {
              const formattedDate = new Date(
                reservation.data_reserva
              ).toLocaleDateString("ca-ES", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const isActive = reservation.estat === "activa";

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
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "1.2rem",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: "0.35rem",
    marginBottom: 0,
    color: "#64748b",
    lineHeight: 1.6,
  },
  countBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.9rem",
  },
  tableContainer: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
    backgroundColor: "white",
  },
  th: {
    textAlign: "left",
    padding: "1rem",
    backgroundColor: "#f8fafc",
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
    backgroundColor: "#ffffff",
  },
  rowOdd: {
    backgroundColor: "#fbfdff",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  userAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0,
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
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    padding: "0.4rem 0.7rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
  },
  statusBadge: {
    display: "inline-block",
    padding: "0.42rem 0.75rem",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "0.84rem",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },
  statusActive: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  emptyState: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 8px 22px rgba(0,0,0,0.05)",
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
};

export default AdminReservationsTable;