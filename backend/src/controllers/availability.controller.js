const db = require("../config/db");
const { ok, fail } = require("../utils/response");
const { isValidDateFormat } = require("../utils/validators");

// Controlador per obtenir la disponibilitat de pistes i franges horàries per a una data concreta
exports.getAvailability = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return fail(res, "Has d'indicar una data", 400);
    }

    if (!isValidDateFormat(date)) {
      return fail(res, "La data ha de tenir format YYYY-MM-DD", 400);
    }

    const [results] = await db.query(
      `
      SELECT 
        c.id AS court_id,
        c.nom_pista,
        c.preu_reserva,
        c.tipus,
        c.coberta,
        t.id AS time_slot_id,
        t.hora_inici,
        t.hora_fi,

        CASE
          WHEN r.id IS NOT NULL THEN false
          WHEN m.id IS NOT NULL THEN false
          ELSE true
        END AS disponible,

        CASE
          WHEN r.id IS NOT NULL THEN 'reserva'
          WHEN m.id IS NOT NULL THEN 'manteniment'
          ELSE NULL
        END AS motiu_no_disponible,

        CASE
          WHEN r.id IS NOT NULL THEN 'Ja hi ha una reserva activa en aquesta franja'
          WHEN m.id IS NOT NULL AND m.motiu IS NOT NULL AND TRIM(m.motiu) <> ''
            THEN CONCAT('Pista bloquejada per manteniment: ', m.motiu)
          WHEN m.id IS NOT NULL THEN 'Pista bloquejada per manteniment'
          ELSE NULL
        END AS detall_no_disponible

      FROM courts c
      CROSS JOIN time_slots t

      LEFT JOIN reservations r
        ON r.court_id = c.id
        AND r.time_slot_id = t.id
        AND r.data_reserva = ?
        AND r.estat = 'activa'

      LEFT JOIN maintenance_blocks m
        ON m.court_id = c.id
        AND m.time_slot_id = t.id
        AND m.data_bloqueig = ?
      
      WHERE c.estat = 'disponible'

      ORDER BY c.id, t.hora_inici
      `,
      [date, date]
    );

    return ok(res, results);
  } catch (error) {
    console.error("Error getAvailability:", error);
    return fail(res, "Error obtenint disponibilitat");
  }
};