const db = require("../config/db");

// Controlador de pistes
exports.getCourts = async (req, res) => {
  try {
    const tipus =
      typeof req.query.tipus === "string" ? req.query.tipus.trim() : "";

    const estat =
      typeof req.query.estat === "string" ? req.query.estat.trim() : "";

    const cobertaRaw =
      typeof req.query.coberta === "string" ? req.query.coberta.trim() : "";

    const whereClauses = [];
    const params = [];

    if (tipus === "") {
      // no fer res
    } else if (tipus) {
      whereClauses.push("tipus = ?");
      params.push(tipus);
    }

    if (estat === "") {
      // no fer res
    } else if (estat) {
      whereClauses.push("estat = ?");
      params.push(estat);
    }

    if (cobertaRaw !== "") {
      if (cobertaRaw !== "0" && cobertaRaw !== "1") {
        return res.status(400).json({
          error: "El filtre 'coberta' només pot ser 0 o 1",
        });
      }

      whereClauses.push("coberta = ?");
      params.push(Number(cobertaRaw));
    }

    let query = "SELECT * FROM courts";

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    query += " ORDER BY id";

    const [courts] = await db.query(query, params);

    res.json({
      data: courts,
    });
  } catch (error) {
    console.error("Error getCourts:", error);
    res.status(500).json({ error: "Error obtenint pistes" });
  }
};