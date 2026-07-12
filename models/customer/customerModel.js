// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get all hawker centres
async function getAllHawkerCentres() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT hawker_centre_id, hawker_centre_name, hawker_centre_address FROM HawkerCentre";
    const result = await connection.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  getAllHawkerCentres,
};