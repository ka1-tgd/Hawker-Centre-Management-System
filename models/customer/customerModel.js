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

// Get all hawker centres with stalls
async function getHawkerCentresWithStalls() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const query = `
    SELECT h.hawker_centre_id, h.hawker_centre_name, h.hawker_centre_address, s.stall_id, s.user_id, s.stall_name, s.description, s.operating_hours, s.contact_number, s.status
    FROM HawkerCentre h
    INNER JOIN Stall s ON h.hawker_centre_id = s.hawker_centre_id
    ORDER BY h.hawker_centre_id;
    `;

    const result = await connection.request().query(query);

    // Group hawker centres and the stalls
    const HCwithStalls = {};
    for (const row of result.recordset) {
      const HawkerCentreId = row.hawker_centre_id;
      if (!HCwithStalls[HawkerCentreId]) {
        HCwithStalls[HawkerCentreId] = {
          hawker_centre_id: HawkerCentreId,
          hawker_centre_name: row.hawker_centre_name,
          hawker_centre_address: row.hawker_centre_address,
          stalls: [],
        };
      }
      // Only add stall if stall_id is not null (for hawker centres with no stalls)
      if (row.stall_id !== null) {
        HCwithStalls[HawkerCentreId].stalls.push({
          stall_id: row.stall_id,
          user_id: row.user_id,
          stall_name: row.stall_name,
          description: row.description,
          operating_hours: row.operating_hours,
          contact_number: row.contact_number,
          status: row.status,
        });
      }
    }

    return Object.values(HCwithStalls);
  } catch (error) {
    console.error("Database error in getHawkerCentresWithStalls:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(
          "Error closing connection after getHawkerCentresWithStalls:",
          err
        );
      }
    }
  }
}

// Get all menu items of a stall
async function getMenuItemsOfStall(stall_id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const query = `
    SELECT s.stall_id, s.stall_name, s.status, mi.menu_item_id, mi.item_name, mi.description, mi.availability, mi.price
    FROM Stall s INNER JOIN Menu m ON s.stall_id = m.menu_id
    INNER JOIN MenuItem mi ON m.menu_id = mi.menu_id
    WHERE stall_id = @stall_id;
    `;
    request.input("stall_id", sql.Int, stall_id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Stall not found
    }
    const result = await connection.request().query(query);

    // Group the menu items base on stall
    const StallWithMenuItems = {};
    for (const row of result.recordset) {
      const StallId = row.stall_id;
      if (!StallWithMenuItems[StallId]) {
        StallWithMenuItems[StallId] = {
          stall_id: StallId,
          stall_name: row.stall_name,
          status: row.status,
          menu_items: [],
        };
      }
      // Only add menu item if menu_item_id is not null (for stall with no menu items)
      if (row.menu_item_id !== null) {
        StallWithMenuItems[StallId].menu_items.push({
          menu_item_id: row.menu_item_id,
          item_name: row.item_name,
          stall_name: row.stall_name,
          description: row.description,
          availability: row.availability,
          status: row.status,
        });
      }
    }

    return Object.values(StallWithMenuItems);
  } catch (error) {
    console.error("Database error in getMenuItemsOfStall:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(
          "Error closing connection after getMenuItemsOfStall:",
          err
        );
      }
    }
  }
}

module.exports = {
  getAllHawkerCentres,
  getHawkerCentreById,
  getHawkerCentresWithStalls,
  getMenuItemsOfStall,
};