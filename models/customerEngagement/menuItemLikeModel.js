// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Create a new like
async function createLike(likeData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "INSERT INTO MenuItemLike (user_id, menu_item_id) VALUES (@user_id, @menu_item_id); SELECT SCOPE_IDENTITY() AS id;";
    const request = connection.request();
    request.input("user_id", likeData.user_id);
    request.input("menu_item_id", likeData.menu_item_id);
    const result = await request.query(query);

    const newLikeId = result.recordset[0].id;
    return await getLikeById(newLikeId);
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

// Get like by LikeID
async function getLikeById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM MenuItemLike WHERE LikeID = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
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

// Check if a customer already liked a specific menu item
async function findLike(userId, menuItemId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "SELECT * FROM MenuItemLike WHERE user_id = @user_id AND menu_item_id = @menu_item_id";
    const request = connection.request();
    request.input("user_id", userId);
    request.input("menu_item_id", menuItemId);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
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

// Get all likes for a menu item, joined with Users for the name
async function getLikesByMenuItem(menuItemId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT l.LikeID, l.user_id, u.name, l.menu_item_id, l.CreatedDate
      FROM MenuItemLike l
      JOIN Users u ON l.user_id = u.user_id
      WHERE l.menu_item_id = @menu_item_id
    `;
    const request = connection.request();
    request.input("menu_item_id", menuItemId);
    const result = await request.query(query);

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

// Get all items liked by a customer
async function getLikesByUser(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT l.LikeID, l.menu_item_id, m.item_name, m.price, l.CreatedDate
      FROM MenuItemLike l
      JOIN MenuItem m ON l.menu_item_id = m.menu_item_id
      WHERE l.user_id = @user_id
    `;
    const request = connection.request();
    request.input("user_id", userId);
    const result = await request.query(query);

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

// Delete a like by LikeID
async function deleteLike(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM MenuItemLike WHERE LikeID = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    return true;
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
  createLike,
  getLikeById,
  findLike,
  getLikesByMenuItem,
  getLikesByUser,
  deleteLike,
};