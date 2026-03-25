const db = require("../config/db");
const {
  normalizeText,
  parsePositiveInteger,
  isValidDateFormat,
  getTodayString,
  validateCourtData,
} = require("../utils/validators");

// Controlador per obtenir tots els usuaris (per a l'administrador)
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT
        id,
        nom,
        email,
        rol,
        created_at
      FROM users
      ORDER BY created_at DESC, id DESC
    `);

    return res.json({
      data: users,
    });
  } catch (error) {
    console.error("Error getAllUsers:", error);
    return res.status(500).json({
      error: "Error obtenint usuaris",
    });
  }
};

// Controlador per obtenir totes les reserves (per a l'administrador)
exports.getAllReservations = async (req, res) => {
  try {
    let {
      estat,
      data,
      page = 1,
      limit = 10,
      sort_by = "created_at",
      order = "desc",
    } = req.query;

    const court_id = req.query.court_id
      ? parsePositiveInteger(req.query.court_id)
      : null;
    const user_id = req.query.user_id
      ? parsePositiveInteger(req.query.user_id)
      : null;
    
    if (req.query.court_id && !court_id) {
      return res.status(400).json({ 
        error: "La pista indicada no és vàlida", 
      });
    }

    if (req.query.user_id && !user_id) {
      return res.status(400).json({ 
        error: "L'usuari indicat no és vàlid", 
      });
    }

    const codi_reserva =
      typeof req.query.codi_reserva === "string"
        ? req.query.codi_reserva.trim().toUpperCase()
        : "";

    page = parsePositiveInteger(page) || 1;
    limit = parsePositiveInteger(limit) || 10;

    const offset = (page - 1) * limit;

    // Validació ordenació
    const allowedSortFields = ["created_at", "data_reserva"];
    const allowedOrder = ["asc", "desc"];

    if (!allowedSortFields.includes(sort_by)) {
      sort_by = "created_at";
    }

    if (!allowedOrder.includes(order.toLowerCase())) {
      order = "desc";
    }

    order = order.toUpperCase();

    const whereClauses = [];
    const params = [];

    if (estat) {
      whereClauses.push("r.estat = ?");
      params.push(estat);
    }

    if (data) {
      whereClauses.push("r.data_reserva = ?");
      params.push(data);
    }

    if (court_id) {
      whereClauses.push("r.court_id = ?");
      params.push(court_id);
    }

    if (user_id) {
      whereClauses.push("r.user_id = ?");
      params.push(user_id);
    }

    if (codi_reserva) {
      whereClauses.push("r.codi_reserva = ?");
      params.push(codi_reserva);
    }

    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const orderClause = `ORDER BY r.${sort_by} ${order}`;

    // Query principal
    const query = `
      SELECT
        r.id,
        r.codi_reserva,
        r.data_reserva,
        r.estat,
        r.preu_total,
        r.estat_pagament,
        r.metode_pagament,
        r.created_at,
        r.user_id,
        r.court_id,
        r.time_slot_id,
        u.nom AS nom_usuari,
        u.email AS email,
        c.nom_pista,
        t.hora_inici,
        t.hora_fi
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN courts c ON r.court_id = c.id
      JOIN time_slots t ON r.time_slot_id = t.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const [reservations] = await db.query(query, [...params, limit, offset]);

    // Query total per paginació
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reservations r
      ${whereClause}
    `;

    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    return res.json({
      data: reservations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error getAllReservations:", error);
    return res.status(500).json({ error: "Error obtenint reserves" });
  }
};

// Controlador per crear una pista
exports.createCourt = async (req, res) => {
  try {
    const validation = validateCourtData(req.body);

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { nom_pista, tipus, coberta, estat, descripcio, preu_reserva } = validation.data;

    const [existingName] = await db.query(
      "SELECT id FROM courts WHERE nom_pista = ? LIMIT 1",
      [nom_pista]
    );

    if (existingName.length > 0) {
      return res.status(409).json({
        error: "Ja existeix una pista amb aquest nom",
      });
    }

    const [result] = await db.query(
      `INSERT INTO courts (nom_pista, tipus, coberta, estat, descripcio, preu_reserva)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom_pista, tipus, coberta, estat, descripcio, preu_reserva || null]
    );

    await db.query(
      `INSERT INTO admin_logs (admin_id, accio, entitat, entitat_id, descripcio)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        "CREATE_COURT",
        "court",
        result.insertId,
        `L'admin ha creat la pista "${nom_pista}"`,
      ]
    );

    res.status(201).json({
      message: "Pista creada correctament",
      data: {
        id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Error createCourt:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Ja existeix una pista amb aquest nom",
      });
    }

    res.status(500).json({
      error: "Error creant la pista",
    });
  }
};

// Controlador per actualitzar una pista
exports.updateCourt = async (req, res) => {
  try {
    const courtId = parsePositiveInteger(req.params.id);
    const validation = validateCourtData(req.body);

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { nom_pista, tipus, coberta, estat, descripcio, preu_reserva } = validation.data;

    const [existingCourt] = await db.query(
      "SELECT * FROM courts WHERE id = ?",
      [courtId]
    );

    if (existingCourt.length === 0) {
      return res.status(404).json({
        error: "Pista no trobada",
      });
    }

    const [existingName] = await db.query(
      "SELECT id FROM courts WHERE nom_pista = ? AND id <> ? LIMIT 1",
      [nom_pista, courtId]
    );

    if (existingName.length > 0) {
      return res.status(409).json({
        error: "Ja existeix una altra pista amb aquest nom",
      });
    }

    await db.query(
      `UPDATE courts
       SET nom_pista = ?, tipus = ?, coberta = ?, estat = ?, descripcio = ?, preu_reserva = ?
       WHERE id = ?`,
      [nom_pista, tipus, coberta, estat, descripcio, preu_reserva || null, courtId]
    );

    await db.query(
      `INSERT INTO admin_logs (admin_id, accio, entitat, entitat_id, descripcio)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        "UPDATE_COURT",
        "court",
        courtId,
        `L'admin ha actualitzat la pista "${nom_pista}"`,
      ]
    );

    res.json({
      message: "Pista actualitzada correctament",
    });
  } catch (error) {
    console.error("Error updateCourt:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Ja existeix una altra pista amb aquest nom",
      });
    }

    res.status(500).json({
      error: "Error actualitzant la pista",
    });
  }
};

// Controlador per eliminar una pista
exports.deleteCourt = async (req, res) => {
  try {
    const courtId = req.params.id;

    const [existingCourt] = await db.query(
      "SELECT * FROM courts WHERE id = ?",
      [courtId]
    );

    if (existingCourt.length === 0) {
      return res.status(404).json({
        error: "Pista no trobada"
      });
    }

    const courtName = existingCourt[0].nom_pista;

    await db.query(
      "DELETE FROM courts WHERE id = ?",
      [courtId]
    );

    await db.query(
      `INSERT INTO admin_logs (admin_id, accio, entitat, entitat_id, descripcio)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        "DELETE_COURT",
        "court",
        Number(courtId),
        `L'admin ha eliminat la pista "${courtName}"`,
      ]
    );

    res.json({
      message: "Pista eliminada correctament"
    });
  } catch (error) {
    console.error("Error deleteCourt:", error);
    res.status(500).json({
      error: "Error eliminant la pista"
    });
  }
};

// Controlador per crear un bloqueig de manteniment
exports.createMaintenanceBlock = async (req, res) => {
  try {
    let { court_id, time_slot_id, data_bloqueig, motiu } = req.body;

    court_id = parsePositiveInteger(court_id);
    time_slot_id = parsePositiveInteger(time_slot_id);
    data_bloqueig =
      typeof data_bloqueig === "string" ? data_bloqueig.trim() : "";
    motiu = normalizeText(motiu);

    if (!court_id || !time_slot_id || !data_bloqueig || !motiu) {
      return res.status(400).json({
        error: "Falten dades obligatòries per crear el bloqueig",
      });
    }

    if (!Number.isInteger(court_id) || court_id <= 0) {
      return res.status(400).json({
        error: "La pista indicada no és vàlida",
      });
    }

    if (!Number.isInteger(time_slot_id) || time_slot_id <= 0) {
      return res.status(400).json({
        error: "La franja horària indicada no és vàlida",
      });
    }

    if (!isValidDateFormat(data_bloqueig)) {
      return res.status(400).json({
        error: "La data del bloqueig ha de tenir format YYYY-MM-DD",
      });
    }

    if (data_bloqueig < getTodayString()) {
      return res.status(400).json({
        error: "No es poden crear bloquejos en dates passades",
      });
    }

    if (motiu.length < 5) {
      return res.status(400).json({
        error: "El motiu del manteniment ha de tenir almenys 5 caràcters",
      });
    }

    if (motiu.length > 300) {
      return res.status(400).json({
        error: "El motiu del manteniment és massa llarg",
      });
    }

    const [court] = await db.query(
      "SELECT * FROM courts WHERE id = ?",
      [court_id]
    );

    if (court.length === 0) {
      return res.status(404).json({
        error: "Pista no trobada",
      });
    }

    const [timeSlot] = await db.query(
      "SELECT * FROM time_slots WHERE id = ?",
      [time_slot_id]
    );

    if (timeSlot.length === 0) {
      return res.status(404).json({
        error: "Franja horària no trobada",
      });
    }

    const [result] = await db.query(
      `INSERT INTO maintenance_blocks (court_id, time_slot_id, data_bloqueig, motiu)
       VALUES (?, ?, ?, ?)`,
      [court_id, time_slot_id, data_bloqueig, motiu]
    );

    const courtName = court[0].nom_pista;
    const horaInici = timeSlot[0].hora_inici;
    const horaFi = timeSlot[0].hora_fi;

    await db.query(
      `INSERT INTO admin_logs (admin_id, accio, entitat, entitat_id, descripcio)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        "CREATE_MAINTENANCE",
        "maintenance_block",
        result.insertId,
        `L'admin ha creat un bloqueig de manteniment per a la pista "${courtName}" el dia ${data_bloqueig} de ${horaInici} a ${horaFi}. Motiu: ${motiu}`,
      ]
    );

    res.status(201).json({
      message: "Bloqueig de manteniment creat correctament",
      data: {
        id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Error createMaintenanceBlock:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Ja existeix un bloqueig per aquesta pista, franja i data",
      });
    }

    res.status(500).json({
      error: "Error creant el bloqueig de manteniment",
    });
  }
};

// Controlador per obtenir estadístiques generals del sistema
exports.getOverviewStats = async (req, res) => {
  try {
    const [[reservationsStats]] = await db.query(`
      SELECT
        COUNT(*) AS totalReservations,
        SUM(CASE WHEN estat = 'activa' THEN 1 ELSE 0 END) AS activeReservations,
        SUM(CASE WHEN estat = 'cancel·lada' THEN 1 ELSE 0 END) AS cancelledReservations
      FROM reservations
    `);

    const [[courtsStats]] = await db.query(`
      SELECT
        COUNT(*) AS totalCourts,
        SUM(CASE WHEN estat = 'disponible' THEN 1 ELSE 0 END) AS availableCourts,
        SUM(CASE WHEN estat = 'manteniment' THEN 1 ELSE 0 END) AS maintenanceCourts
      FROM courts
    `);

    const [[usersStats]] = await db.query(`
      SELECT COUNT(*) AS totalUsers
      FROM users
      WHERE rol = 'usuari'
    `);

    res.json({
      data: {
        totalReservations: Number(reservationsStats.totalReservations) || 0,
        activeReservations: Number(reservationsStats.activeReservations) || 0,
        cancelledReservations: Number(reservationsStats.cancelledReservations) || 0,
        totalCourts: Number(courtsStats.totalCourts) || 0,
        availableCourts: Number(courtsStats.availableCourts) || 0,
        maintenanceCourts: Number(courtsStats.maintenanceCourts) || 0,
        totalUsers: Number(usersStats.totalUsers) || 0,
      },
    });
  } catch (error) {
    console.error("Error getOverviewStats:", error);
    res.status(500).json({
      error: "Error obtenint les estadístiques generals",
    });
  }
};

// Estadístiques de reserves agrupades per pista
exports.getReservationsByCourtStats = async (req, res) => {
  try {
    const from =
      typeof req.query.from === "string" ? req.query.from.trim() : "";
    const to =
      typeof req.query.to === "string" ? req.query.to.trim() : "";

    if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      return res.status(400).json({
        error: "El paràmetre 'from' ha de tenir format YYYY-MM-DD",
      });
    }

    if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({
        error: "El paràmetre 'to' ha de tenir format YYYY-MM-DD",
      });
    }

    if (from && to && from > to) {
      return res.status(400).json({
        error: "El paràmetre 'from' no pot ser posterior a 'to'",
      });
    }

    const dateConditions = [];
    const params = [];

    if (from) {
      dateConditions.push("r.data_reserva >= ?");
      params.push(from);
    }

    if (to) {
      dateConditions.push("r.data_reserva <= ?");
      params.push(to);
    }

    let joinClause = "LEFT JOIN reservations r ON r.court_id = c.id";

    if (dateConditions.length > 0) {
      joinClause += ` AND ${dateConditions.join(" AND ")}`;
    }

    const query = `
      SELECT
        c.id AS court_id,
        c.nom_pista,
        COUNT(r.id) AS totalReservations,
        SUM(CASE WHEN r.estat = 'activa' THEN 1 ELSE 0 END) AS activeReservations,
        SUM(CASE WHEN r.estat = 'cancel·lada' THEN 1 ELSE 0 END) AS cancelledReservations
      FROM courts c
      ${joinClause}
      GROUP BY c.id, c.nom_pista
      ORDER BY totalReservations DESC, c.id ASC
    `;

    const [rows] = await db.query(query, params);

    res.json({
      data: rows.map((row) => ({
        court_id: row.court_id,
        nom_pista: row.nom_pista,
        totalReservations: Number(row.totalReservations) || 0,
        activeReservations: Number(row.activeReservations) || 0,
        cancelledReservations: Number(row.cancelledReservations) || 0,
      })),
    });
  } catch (error) {
    console.error("Error getReservationsByCourtStats:", error);
    res.status(500).json({
      error: "Error obtenint les estadístiques per pista",
    });
  }
};

// Estadístiques de reserves agrupades per franja horària
exports.getReservationsByTimeslotStats = async (req, res) => {
  try {
    const from =
      typeof req.query.from === "string" ? req.query.from.trim() : "";
    const to =
      typeof req.query.to === "string" ? req.query.to.trim() : "";

    if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      return res.status(400).json({
        error: "El paràmetre 'from' ha de tenir format YYYY-MM-DD",
      });
    }

    if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({
        error: "El paràmetre 'to' ha de tenir format YYYY-MM-DD",
      });
    }

    if (from && to && from > to) {
      return res.status(400).json({
        error: "El paràmetre 'from' no pot ser posterior a 'to'",
      });
    }

    const dateConditions = [];
    const params = [];

    if (from) {
      dateConditions.push("r.data_reserva >= ?");
      params.push(from);
    }

    if (to) {
      dateConditions.push("r.data_reserva <= ?");
      params.push(to);
    }

    let joinClause = "LEFT JOIN reservations r ON r.time_slot_id = t.id";

    if (dateConditions.length > 0) {
      joinClause += ` AND ${dateConditions.join(" AND ")}`;
    }

    const query = `
      SELECT
        t.id AS time_slot_id,
        t.hora_inici,
        t.hora_fi,
        COUNT(r.id) AS totalReservations,
        SUM(CASE WHEN r.estat = 'activa' THEN 1 ELSE 0 END) AS activeReservations,
        SUM(CASE WHEN r.estat = 'cancel·lada' THEN 1 ELSE 0 END) AS cancelledReservations
      FROM time_slots t
      ${joinClause}
      GROUP BY t.id, t.hora_inici, t.hora_fi
      ORDER BY totalReservations DESC, t.hora_inici ASC
    `;

    const [rows] = await db.query(query, params);

    res.json({
      data: rows.map((row) => ({
        time_slot_id: row.time_slot_id,
        hora_inici: row.hora_inici,
        hora_fi: row.hora_fi,
        totalReservations: Number(row.totalReservations) || 0,
        activeReservations: Number(row.activeReservations) || 0,
        cancelledReservations: Number(row.cancelledReservations) || 0,
      })),
    });
  } catch (error) {
    console.error("Error getReservationsByTimeslotStats:", error);
    res.status(500).json({
      error: "Error obtenint les estadístiques per franja horària",
    });
  }
};

// Estadístiques de reserves agrupades per data
exports.getReservationsByDateStats = async (req, res) => {
  try {
    const from =
      typeof req.query.from === "string" ? req.query.from.trim() : "";
    const to =
      typeof req.query.to === "string" ? req.query.to.trim() : "";

    if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      return res.status(400).json({
        error: "El paràmetre 'from' ha de tenir format YYYY-MM-DD",
      });
    }

    if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({
        error: "El paràmetre 'to' ha de tenir format YYYY-MM-DD",
      });
    }

    if (from && to && from > to) {
      return res.status(400).json({
        error: "El paràmetre 'from' no pot ser posterior a 'to'",
      });
    }

    const whereClauses = [];
    const params = [];

    if (from) {
      whereClauses.push("r.data_reserva >= ?");
      params.push(from);
    }

    if (to) {
      whereClauses.push("r.data_reserva <= ?");
      params.push(to);
    }

    let query = `
      SELECT
        r.data_reserva,
        COUNT(r.id) AS totalReservations,
        SUM(CASE WHEN r.estat = 'activa' THEN 1 ELSE 0 END) AS activeReservations,
        SUM(CASE WHEN r.estat = 'cancel·lada' THEN 1 ELSE 0 END) AS cancelledReservations
      FROM reservations r
    `;

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    query += `
      GROUP BY r.data_reserva
      ORDER BY r.data_reserva ASC
    `;

    const [rows] = await db.query(query, params);

    res.json({
      data: rows.map((row) => ({
        data_reserva: row.data_reserva,
        totalReservations: Number(row.totalReservations) || 0,
        activeReservations: Number(row.activeReservations) || 0,
        cancelledReservations: Number(row.cancelledReservations) || 0,
      })),
    });
  } catch (error) {
    console.error("Error getReservationsByDateStats:", error);
    res.status(500).json({
      error: "Error obtenint les estadístiques per data",
    });
  }
};

// Controlador per obtenir els logs d'accions administratives
exports.getAdminLogs = async (req, res) => {
  try {
    const accio =
      typeof req.query.accio === "string" ? req.query.accio.trim() : "";

    const admin_id = req.query.admin_id
      ? parsePositiveInteger(req.query.admin_id)
      : null;
    
      const page = req.query.page ? parsePositiveInteger(req.query.page) : 1;
      const limit = req.query.limit ? parsePositiveInteger(req.query.limit) : 10;

    if (!page) {
      return res.status(400).json({
        error: "El paràmetre 'page' ha de ser un enter positiu",
      });
    }

    if (!limit) {
      return res.status(400).json({
        error: "El paràmetre 'limit' ha de ser un enter positiu",
      });
    }

    if (req.query.admin_id && !admin_id) {
      return res.status(400).json({
        error: "L'admin indicat no és vàlid",
      });
    }

    const allowedActions = [
      "CREATE_COURT",
      "UPDATE_COURT",
      "DELETE_COURT",
      "CREATE_MAINTENANCE",
    ];

    if (accio && !allowedActions.includes(accio)) {
      return res.status(400).json({
        error:
          "L'acció indicada no és vàlida. Valors permesos: CREATE_COURT, UPDATE_COURT, DELETE_COURT, CREATE_MAINTENANCE",
      });
    }

    const whereClauses = [];
    const params = [];

    if (accio) {
      whereClauses.push("l.accio = ?");
      params.push(accio);
    }

    if (admin_id) {
      whereClauses.push("l.admin_id = ?");
      params.push(admin_id);
    }

    let baseQuery = `
      FROM admin_logs l
      JOIN users u ON l.admin_id = u.id
    `;

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    const countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;
    const [countRows] = await db.query(countQuery, params);

    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const dataQuery = `
      SELECT
        l.id,
        l.admin_id,
        u.nom AS admin_nom,
        u.email AS admin_email,
        l.accio,
        l.entitat,
        l.entitat_id,
        l.descripcio,
        l.created_at
      ${baseQuery}
      ORDER BY l.created_at DESC, l.id DESC
      LIMIT ? OFFSET ?
    `;

    const [logs] = await db.query(dataQuery, [...params, limit, offset]);

    res.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error getAdminLogs:", error);
    res.status(500).json({
      error: "Error obtenint els logs administratius",
    });
  }
};

// Controlador per obtenir els detalls d'una reserva concreta (per a l'administrador)
exports.getReservationByIdAdmin = async (req, res) => {
  try {
    const reservationId = parsePositiveInteger(req.params.id);

    if (!reservationId) {
      return res.status(400).json({ error: "ID de reserva no vàlid" });
    }

    const query = `
      SELECT
        r.id,
        r.codi_reserva,
        r.data_reserva,
        r.estat,
        r.preu_total,
        r.estat_pagament,
        r.metode_pagament,
        r.created_at,

        r.user_id,
        u.nom AS usuari_nom,
        u.email AS usuari_email,
        u.telefon AS usuari_telefon,

        r.court_id,
        c.nom_pista,
        c.tipus,
        c.coberta,

        r.time_slot_id,
        t.hora_inici,
        t.hora_fi

      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN courts c ON r.court_id = c.id
      JOIN time_slots t ON r.time_slot_id = t.id
      WHERE r.id = ?
      LIMIT 1
    `;

    const [results] = await db.query(query, [reservationId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Reserva no trobada" });
    }

    return res.json({
      data: results[0],
    });
  } catch (error) {
    console.error("Error getReservationByIdAdmin:", error);
    return res.status(500).json({ error: "Error obtenint la reserva" });
  }
};

// Controlador per exportar les reserves a CSV segons els filtres aplicats
exports.exportReservationsCsv = async (req, res) => {
  try {
    const estat =
      typeof req.query.estat === "string" ? req.query.estat.trim() : "";

    const data =
      typeof req.query.data === "string" ? req.query.data.trim() : "";

    const court_id = req.query.court_id ? Number(req.query.court_id) : null;
    const user_id = req.query.user_id ? Number(req.query.user_id) : null;

    const codi_reserva =
      typeof req.query.codi_reserva === "string"
        ? req.query.codi_reserva.trim().toUpperCase()
        : "";

    const whereClauses = [];
    const params = [];

    if (estat) {
      whereClauses.push("r.estat = ?");
      params.push(estat);
    }

    if (data) {
      whereClauses.push("r.data_reserva = ?");
      params.push(data);
    }

    if (court_id) {
      whereClauses.push("r.court_id = ?");
      params.push(court_id);
    }

    if (user_id) {
      whereClauses.push("r.user_id = ?");
      params.push(user_id);
    }

    if (codi_reserva) {
      whereClauses.push("r.codi_reserva = ?");
      params.push(codi_reserva);
    }

    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const query = `
      SELECT
        r.id,
        r.codi_reserva,
        r.data_reserva,
        r.estat,
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
      ${whereClause}
      ORDER BY r.created_at DESC
    `;

    const [reservations] = await db.query(query, params);

    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    };

    const header = [
      "id",
      "codi_reserva",
      "data_reserva",
      "estat",
      "created_at",
      "usuari_nom",
      "usuari_email",
      "nom_pista",
      "hora_inici",
      "hora_fi",
    ];

    const rows = reservations.map((reservation) =>
      [
        reservation.id,
        reservation.codi_reserva,
        reservation.data_reserva,
        reservation.estat,
        reservation.created_at,
        reservation.usuari_nom,
        reservation.usuari_email,
        reservation.nom_pista,
        reservation.hora_inici,
        reservation.hora_fi,
      ]
        .map(escapeCsvValue)
        .join(",")
    );

    const csvContent = [header.join(","), ...rows].join("\n");

    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `reservations-${timestamp}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exportReservationsCsv:", error);
    return res.status(500).json({ error: "Error exportant reserves a CSV" });
  }
};