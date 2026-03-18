const db = require("../config/db");
const { ok, message, fail } = require("../utils/response");
const {
  isValidDateFormat,
  getTodayString,
  parsePositiveInteger,
  isValidReservationStatus,
} = require("../utils/validators");

// Crear reserva (amb comprovacions de disponibilitat i bloqueig)
exports.createReservation = async (req, res) => {
  try {
    const user_id = req.user.id;
    let { court_id, time_slot_id, data_reserva } = req.body;
    let { metode_pagament } = req.body;

    court_id = parsePositiveInteger(court_id);
    time_slot_id = parsePositiveInteger(time_slot_id);
    data_reserva =
      typeof data_reserva === "string" ? data_reserva.trim() : "";

    if (!court_id || !time_slot_id || !data_reserva) {
      return fail(res, "Falten dades obligatòries", 400);
    }

    if (!isValidDateFormat(data_reserva)) {
      return fail(res, "La data ha de tenir format YYYY-MM-DD", 400);
    }

    const todayString = getTodayString();

    if (data_reserva < todayString) {
      return fail(res, "No es poden fer reserves en dates passades", 400);
    }

    // Normalitzar i validar el mètode de pagament
    if (typeof metode_pagament === "string") {
      metode_pagament = metode_pagament.trim().toLowerCase();
    } else {
      metode_pagament = "al_club";
    }

    // Validar que el mètode de pagament és vàlid
    const allowedMethods = ["online_simulat", "al_club"];

    if (!allowedMethods.includes(metode_pagament)) {
      return res.status(400).json({ error: "Mètode de pagament no vàlid" });
    }

    // Determinar l'estat del pagament en funció del mètode de pagament
    let estat_pagament = "pendent";

    if (metode_pagament === "online_simulat") {
      estat_pagament = "pagat";
    }

    // 1. Comprovar que la pista existeix i que sigui reservable
    const [courts] = await db.query(
      "SELECT id, estat, preu_reserva FROM courts WHERE id = ? LIMIT 1",
      [court_id]
    );

    if (courts.length === 0) {
      return fail(res, "La pista indicada no existeix", 404);
    }

    const court = courts[0];

    if (court.estat !== "disponible") {
      return fail(res, "Aquesta pista no està disponible per reservar", 400);
    }

    const preu_total = Number(court.preu_reserva || 0);

    // 2. Comprovar que la franja existeix
    const [timeSlots] = await db.query(
      "SELECT id FROM time_slots WHERE id = ? LIMIT 1",
      [time_slot_id]
    );

    if (timeSlots.length === 0) {
      return fail(res, "La franja horària indicada no existeix", 404);
    }

    // 3. Comprovar límit de reserves actives per usuari
    const [userActiveReservations] = await db.query(
      `SELECT COUNT(*) AS total
       FROM reservations
       WHERE user_id = ? AND estat = 'activa'`,
      [user_id]
    );

    if (userActiveReservations[0].total >= 3) {
      return fail(res, "Has arribat al límit màxim de 3 reserves actives", 400);
    }

    // 4. Comprovar si ja existeix una reserva activa per aquesta pista, franja i data
    const [existingReservations] = await db.query(
      `SELECT id FROM reservations
       WHERE court_id = ? AND time_slot_id = ? AND data_reserva = ? AND estat = 'activa'`,
      [court_id, time_slot_id, data_reserva]
    );

    if (existingReservations.length > 0) {
      return fail(
        res,
        "Aquesta pista ja està reservada en aquesta franja i data",
        400
      );
    }

    // 5. Comprovar si la pista està bloquejada per manteniment
    const [maintenanceBlocks] = await db.query(
      `SELECT id FROM maintenance_blocks
       WHERE court_id = ? AND time_slot_id = ? AND data_bloqueig = ?`,
      [court_id, time_slot_id, data_reserva]
    );

    if (maintenanceBlocks.length > 0) {
      return fail(
        res,
        "La pista està bloquejada per manteniment en aquesta franja i data",
        400
      );
    }

    // 6. Crear la reserva amb codi temporal
    const codiTemporal = `TEMP-${Date.now()}-${user_id}`;

    const [insertResult] = await db.query(
      `INSERT INTO reservations (
        codi_reserva, 
        user_id, 
        court_id, 
        time_slot_id, 
        data_reserva, 
        estat, 
        preu_total,
        estat_pagament,
        metode_pagament
        )
      VALUES (?, ?, ?, ?, ?, 'activa', ?, ?, ?)`,
      [codiTemporal, user_id, court_id, time_slot_id, data_reserva, preu_total, estat_pagament, metode_pagament]
    );

    const reservationId = insertResult.insertId;
    const codi_reserva = `PB-${data_reserva.replace(/-/g, "")}-${String(reservationId).padStart(3, "0")}`;

    // 7. Guardar el codi definitiu
    await db.query(
      `UPDATE reservations
      SET codi_reserva = ?
      WHERE id = ?`,
      [codi_reserva, reservationId]
    );

    return message(res, "Reserva creada correctament", 201, {
      id: reservationId,
      codi_reserva,
      preu_total,
      estat_pagament,
    });
      } catch (error) {
        console.error("Error createReservation:", error);

        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            error: "Ja existeix un conflicte de reserva per aquesta pista, franja i data.",
          });
        }

        return res.status(500).json({
          error: "Error creant la reserva",
        });
      }
    };

// Obtenir reserves (totes per admin, només del propi usuari per a usuari normal)
exports.getReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.rol;
    const estat =
      typeof req.query.estat === "string"
        ? req.query.estat.trim().toLowerCase()
        : "";

    let query = "";
    let params = [];
    let whereClauses = [];

    if (estat && !isValidReservationStatus(estat)) {
      return fail(
        res,
        "El filtre d'estat només pot ser 'activa' o 'cancel·lada'",
        400
      );
    }

    if (userRole === "admin") {
      query = `
        SELECT 
          r.id,
          r.codi_reserva,
          r.data_reserva,
          r.estat,
          r.preu_total,
          r.estat_pagament,
          r.metode_pagament,
          r.created_at,
          u.nom AS usuari_nom,
          u.email AS usuari_email,
          c.nom_pista,
          t.hora_inici,
          t.hora_fi
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN courts c ON r.court_id = c.id
        JOIN time_slots t ON r.time_slot_id = t.id
      `;

      if (estat) {
        whereClauses.push("r.estat = ?");
        params.push(estat);
      }
    } else {
      query = `
        SELECT 
          r.id,
          r.codi_reserva,
          r.data_reserva,
          r.estat,
          r.created_at,
          c.nom_pista,
          t.hora_inici,
          t.hora_fi
        FROM reservations r
        JOIN courts c ON r.court_id = c.id
        JOIN time_slots t ON r.time_slot_id = t.id
      `;

      whereClauses.push("r.user_id = ?");
      params.push(userId);

      if (estat) {
        whereClauses.push("r.estat = ?");
        params.push(estat);
      }
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    query += ` ORDER BY r.data_reserva, t.hora_inici`;

    const [reservations] = await db.query(query, params);

    return ok(res, reservations);
  } catch (error) {
    console.error("Error getReservations:", error);
    return fail(res, "Error obtenint reserves");
  }
};

// Cancel·lar reserva (només el propietari o admin)
exports.deleteReservation = async (req, res) => {
  try {
    const reservationId = parsePositiveInteger(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.rol;

    if (!reservationId) {
      return fail(res, "L'identificador de la reserva no és vàlid", 400);
    }

    // 1. Comprovar si la reserva existeix
    const [reservations] = await db.query(
      "SELECT * FROM reservations WHERE id = ?",
      [reservationId]
    );

    if (reservations.length === 0) {
      return fail(res, "Reserva no trobada", 404);
    }

    const reservation = reservations[0];

    // 2. Si no és admin, només pot cancel·lar les seves reserves
    if (userRole !== "admin" && reservation.user_id !== userId) {
      return fail(res, "No tens permís per cancel·lar aquesta reserva", 403);
    }

    // 3. Si la reserva ja està cancel·lada, informar-ho
    if (reservation.estat === "cancel·lada") {
      return fail(res, "Aquesta reserva ja està cancel·lada", 400);
    }

    // 4. Cancel·lació lògica
    await db.query(
      "UPDATE reservations SET estat = 'cancel·lada' WHERE id = ?",
      [reservationId]
    );

    return message(res, "Reserva cancel·lada correctament");
  } catch (error) {
    console.error("Error deleteReservation:", error);
    return fail(res, "Error cancel·lant la reserva");
  }
};

// Obtenir una reserva pel seu codi
exports.getReservationByCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.rol;
    const codi_reserva =
      typeof req.params.codi_reserva === "string"
        ? req.params.codi_reserva.trim().toUpperCase()
        : "";

    if (!codi_reserva) {
      return fail(res, "El codi de reserva és obligatori", 400);
    }

    let query = `
      SELECT
        r.id,
        r.codi_reserva,
        r.user_id,
        r.court_id,
        r.time_slot_id,
        r.data_reserva,
        r.estat,
        r.preu_total,
        r.estat_pagament,
        r.metode_pagament,
        r.created_at,
        c.nom_pista,
        t.hora_inici,
        t.hora_fi
      FROM reservations r
      JOIN courts c ON r.court_id = c.id
      JOIN time_slots t ON r.time_slot_id = t.id
      WHERE r.codi_reserva = ?
    `;

    const params = [codi_reserva];

    if (userRole !== "admin") {
      query += ` AND r.user_id = ?`;
      params.push(userId);
    }

    query += ` LIMIT 1`;

    const [reservations] = await db.query(query, params);

    if (reservations.length === 0) {
      return fail(res, "Reserva no trobada", 404);
    }

    return ok(res, reservations[0]);
  } catch (error) {
    console.error("Error getReservationByCode:", error);
    return fail(res, "Error obtenint la reserva");
  }
};