const db = require("../config/db");
const { ok, fail } = require("../utils/response");

// Controlador de franges horàries
exports.getTimeSlots = async (req, res) => {
  try {
    const [slots] = await db.query("SELECT * FROM time_slots");
    return ok(res, slots);
  } catch (error) {
    console.error("Error getTimeSlots:", error);
    return fail(res, "Error obtenint horaris");
  }
};