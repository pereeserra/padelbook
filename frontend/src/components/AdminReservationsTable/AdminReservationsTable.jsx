import { useMemo, useState } from "react";
import "./AdminReservationsTable.css";

function AdminReservationsTable({ reservations = [] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("totes");

  const normalizedReservations = useMemo(() => {
    return [...reservations].sort((a, b) => {
      const dateA = new Date(
        `${a.data_reserva || ""}T${a.hora_inici || "00:00"}`
      ).getTime();
      const dateB = new Date(
        `${b.data_reserva || ""}T${b.hora_inici || "00:00"}`
      ).getTime();
      return dateB - dateA;
    });
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedReservations.filter((reservation) => {
      const userName = (reservation.nom_usuari || "").toLowerCase();
      const email = (reservation.email || "").toLowerCase();
      const courtName = (reservation.nom_pista || "").toLowerCase();
      const reservationCode = (reservation.codi_reserva || "").toLowerCase();
      const status = (reservation.estat || "").toLowerCase();

      const matchesSearch =
        !query ||
        userName.includes(query) ||
        email.includes(query) ||
        courtName.includes(query) ||
        reservationCode.includes(query);

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
      <div className="admin-res__empty-state">
        <span className="admin-res__empty-icon">📋</span>
        <h3 className="admin-res__empty-title">No hi ha reserves registrades</h3>
        <p className="admin-res__empty-text">
          Quan els usuaris facin reserves, apareixeran aquí perquè les puguis
          consultar des del panell d&apos;administració.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-res__wrapper">
      <div className="admin-res__table-header">
        <div>
          <span className="admin-res__eyebrow">Control administratiu</span>
          <h3 className="admin-res__title">Reserves registrades</h3>
          <p className="admin-res__subtitle">
            Vista general de totes les reserves creades al sistema, amb filtres
            ràpids per revisar-les millor.
          </p>
        </div>

        <span className="admin-res__count-badge">
          {filteredReservations.length} visibles
        </span>
      </div>

      <div className="admin-res__summary-grid">
        <article className="admin-res__summary-card">
          <span className="admin-res__summary-label">Totals</span>
          <span className="admin-res__summary-value">{reservations.length}</span>
        </article>

        <article className="admin-res__summary-card">
          <span className="admin-res__summary-label">Actives</span>
          <span className="admin-res__summary-value">{activeCount}</span>
        </article>

        <article className="admin-res__summary-card">
          <span className="admin-res__summary-label">Cancel·lades</span>
          <span className="admin-res__summary-value">{cancelledCount}</span>
        </article>

        <article className="admin-res__summary-card">
          <span className="admin-res__summary-label">Mostrades</span>
          <span className="admin-res__summary-value">{filteredReservations.length}</span>
        </article>
      </div>

      <div className="admin-res__tools-grid">
        <div className="admin-res__field">
          <label htmlFor="reservationSearch" className="admin-res__label">
            Cercar reserva
          </label>
          <input
            id="reservationSearch"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Codi, usuari, correu o pista..."
            className="pb-input"
          />
        </div>

        <div className="admin-res__field">
          <label htmlFor="reservationStatus" className="admin-res__label">
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

        <div className="admin-res__field-action">
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
        <div className="admin-res__table-container">
          <table className="admin-res__table">
            <thead>
              <tr>
                <th className="admin-res__th">Codi</th>
                <th className="admin-res__th">Usuari</th>
                <th className="admin-res__th">Correu</th>
                <th className="admin-res__th">Pista</th>
                <th className="admin-res__th">Data</th>
                <th className="admin-res__th">Hora</th>
                <th className="admin-res__th">Preu</th>
                <th className="admin-res__th">Pagament</th>
                <th className="admin-res__th">Estat pagament</th>
                <th className="admin-res__th">Estat</th>
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
                    className={`admin-res__row ${
                      index % 2 === 0 ? "admin-res__row--even" : "admin-res__row--odd"
                    }`}
                  >
                    <td className="admin-res__td">
                      <span className="admin-res__code-badge">
                        {reservation.codi_reserva || "-"}
                      </span>
                    </td>

                    <td className="admin-res__td">
                      <div className="admin-res__user-cell">
                        <span className="admin-res__user-avatar">
                          {(reservation.nom_usuari || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                        <div>
                          <p className="admin-res__primary-text">
                            {reservation.nom_usuari || "Usuari"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="admin-res__td">
                      <span className="admin-res__secondary-text">
                        {reservation.email || "-"}
                      </span>
                    </td>

                    <td className="admin-res__td">
                      <span className="admin-res__primary-text">
                        {reservation.nom_pista || "-"}
                      </span>
                    </td>

                    <td className="admin-res__td">
                      <span className="admin-res__secondary-text">{formattedDate}</span>
                    </td>

                    <td className="admin-res__td">
                      <span className="admin-res__time-badge">
                        {reservation.hora_inici} - {reservation.hora_fi}
                      </span>
                    </td>

                    <td className="admin-res__td">
                      <span className="admin-res__primary-text">
                        {reservation.preu_total != null
                          ? `${Number(reservation.preu_total).toFixed(2)} €`
                          : reservation.preu != null
                          ? `${Number(reservation.preu).toFixed(2)} €`
                          : "-"}
                      </span>
                    </td>

                    <td className="admin-res__td">
                      <span className="admin-res__secondary-text">
                        {reservation.metode_pagament || "-"}
                      </span>
                    </td>

                    <td className="admin-res__td">
                      <span className="admin-res__secondary-text">
                        {reservation.estat_pagament || "-"}
                      </span>
                    </td>

                    <td className="admin-res__td">
                      <span
                        className={`admin-res__status-badge ${
                          isActive
                            ? "admin-res__status-badge--active"
                            : "admin-res__status-badge--inactive"
                        }`}
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
        <div className="admin-res__empty-filtered-state">
          <p className="admin-res__empty-filtered-title">No s&apos;ha trobat cap reserva</p>
          <p className="admin-res__empty-filtered-text">
            Ajusta la cerca o l'estat seleccionat per tornar a veure resultats.
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

export default AdminReservationsTable;