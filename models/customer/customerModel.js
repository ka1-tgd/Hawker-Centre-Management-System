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

// Get Hawker Centre by ID
async function getHawkerCentreById(hawker_centre_id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT hawker_centre_name, hawker_centre_address FROM HawkerCentre WHERE hawker_centre_id = @hawker_centre_id";
    const request = connection.request();
    request.input("hawker_centre_id", sql.Int, hawker_centre_id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Hawker centre not found
    }

    return result.recordset[0];
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
  getHawkerCentreById,
};