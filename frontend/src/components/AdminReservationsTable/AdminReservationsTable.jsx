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


 function paymentMethodLabel(method) {
  if (method === "online_simulat") return "Pagament online";
  if (method === "al_club") return "Pagament al club";
  return "No definit";
}

function paymentStatusLabel(status) {
  if (status === "pagat") return "Pagat";
  if (status === "pendent") return "Pendent";
  return "No definit";
}

function formatDate(date) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("ca-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "-";
  return String(time).slice(0, 5);
}

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedReservations.filter((reservation) => {
      const userName = (reservation.nom_usuari || "").toLowerCase();
      const email = (reservation.email || "").toLowerCase();
      const courtName = (reservation.nom_pista || "").toLowerCase();
      const reservationCode = (reservation.codi_reserva || "").toLowerCase();
      const status = (reservation.estat || "").toLowerCase();
      const paymentStatus = (reservation.estat_pagament || "").toLowerCase();
      const paymentMethod = (reservation.metode_pagament || "").toLowerCase();
      const formattedPaymentMethod = paymentMethodLabel(
        reservation.metode_pagament
      ).toLowerCase();
      const formattedPaymentStatus = paymentStatusLabel(
        reservation.estat_pagament
      ).toLowerCase();
      const formattedDate = formatDate(reservation.data_reserva).toLowerCase();
      const startTime = formatTime(reservation.hora_inici).toLowerCase();
      const endTime = formatTime(reservation.hora_fi).toLowerCase();
      const fullTimeRange = `${startTime} - ${endTime}`.toLowerCase();

      const reservationPrice =
        reservation.preu_total != null
          ? `${Number(reservation.preu_total).toFixed(2)} €`
          : reservation.preu != null
            ? `${Number(reservation.preu).toFixed(2)} €`
            : "-";

      const priceText = reservationPrice.toLowerCase();

      const searchableText = [
        userName,
        email,
        courtName,
        reservationCode,
        status,
        paymentStatus,
        paymentMethod,
        formattedPaymentMethod,
        formattedPaymentStatus,
        formattedDate,
        startTime,
        endTime,
        fullTimeRange,
        priceText,
      ].join(" ");

      const matchesSearch = !query || searchableText.includes(query);

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

  const getReservationStatusClass = (value) => {
    const normalized = (value || "").toLowerCase();
    return normalized === "activa" || normalized === "active"
      ? "admin-res__pill admin-res__pill--active"
      : "admin-res__pill admin-res__pill--cancelled";
  };

  const getPaymentStatusClass = (value) => {
    const normalized = (value || "").toLowerCase();
    return normalized === "pagat"
      ? "admin-res__pill admin-res__pill--paid"
      : "admin-res__pill admin-res__pill--pending";
  };

  const getPaymentMethodClass = (value) => {
    const normalized = (value || "").toLowerCase();
    return normalized === "online_simulat"
      ? "admin-res__pill admin-res__pill--info"
      : "admin-res__pill admin-res__pill--neutral";
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
      <div className="admin-res__header">
        <div>
          <span className="admin-res__eyebrow">Control administratiu</span>
          <h3 className="admin-res__title">Reserves registrades</h3>
          <p className="admin-res__subtitle">
            Vista clara de les reserves del sistema, amb filtres simples i una
            lectura molt més ràpida.
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
        <div className="admin-res__field admin-res__field--search">
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
            <option value="cancel·lada">Cancel·lades</option>
          </select>
        </div>

        <div className="admin-res__field-action">
          <button type="button" className="btn btn-light" onClick={clearFilters}>
            Netejar filtres
          </button>
        </div>
      </div>

      {filteredReservations.length > 0 ? (
        <div className="admin-res__list">
          {filteredReservations.map((reservation) => {
            const formattedDate = formatDate(reservation.data_reserva);
            const reservationPrice =
              reservation.preu_total != null
                ? `${Number(reservation.preu_total).toFixed(2)} €`
                : reservation.preu != null
                  ? `${Number(reservation.preu).toFixed(2)} €`
                  : "-";

            return (
              <article key={reservation.id} className="admin-res__card">
                <div className="admin-res__card-top">
                  <div className="admin-res__identity-block">
                    <span className="admin-res__code-badge">
                      {reservation.codi_reserva || "Sense codi"}
                    </span>

                    <div className="admin-res__user-row">
                      <span className="admin-res__user-avatar">
                        {(reservation.nom_usuari || reservation.email || "U").charAt(0).toUpperCase()}
                      </span>

                      <div className="admin-res__user-meta">
                        <p className="admin-res__primary-text">
                          {reservation.nom_usuari || "Usuari sense nom"}
                        </p>
                        <p className="admin-res__secondary-text admin-res__secondary-text--compact">
                          {reservation.email || "Correu no disponible"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-res__status-stack">
                    <span className={getReservationStatusClass(reservation.estat)}>
                      {reservation.estat || "Sense estat"}
                    </span>
                    <span className={getPaymentStatusClass(reservation.estat_pagament)}>
                      {paymentStatusLabel(reservation.estat_pagament)}
                    </span>
                  </div>
                </div>

                <div className="admin-res__details-grid">
                  <div className="admin-res__detail-item">
                    <span className="admin-res__detail-label">Pista</span>
                    <span className="admin-res__detail-value">
                      {reservation.nom_pista || "No indicada"}
                    </span>
                  </div>

                  <div className="admin-res__detail-item">
                    <span className="admin-res__detail-label">Data</span>
                    <span className="admin-res__detail-value">{formattedDate}</span>
                  </div>

                  <div className="admin-res__detail-item">
                    <span className="admin-res__detail-label">Hora</span>
                    <span className="admin-res__time-badge">
                      {formatTime(reservation.hora_inici)} - {formatTime(reservation.hora_fi)}
                    </span>
                  </div>

                  <div className="admin-res__detail-item">
                    <span className="admin-res__detail-label">Import</span>
                    <span className="admin-res__detail-value admin-res__detail-value--price">
                      {reservationPrice}
                    </span>
                  </div>
                </div>

                <div className="admin-res__card-footer">
                  <div className="admin-res__payment-block">
                    <span className="admin-res__payment-label">Forma de pagament</span>

                    <span
                      className={`admin-res__payment-method ${
                        reservation.metode_pagament === "online_simulat"
                          ? "admin-res__payment-method--online"
                          : "admin-res__payment-method--club"
                      }`}
                    >
                      {reservation.metode_pagament === "online_simulat"
                        ? "Pagament online"
                        : reservation.metode_pagament === "al_club"
                          ? "Pagament al club"
                          : paymentMethodLabel(reservation.metode_pagament)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="admin-res__empty-filtered-state">
          <p className="admin-res__empty-filtered-title">No s&apos;ha trobat cap reserva</p>
          <p className="admin-res__empty-filtered-text">
            Ajusta la cerca o l&apos;estat seleccionat per tornar a veure resultats.
          </p>

          <button type="button" className="btn btn-light" onClick={clearFilters}>
            Mostrar totes les reserves
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminReservationsTable;