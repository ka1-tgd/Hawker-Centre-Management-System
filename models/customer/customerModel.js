// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get Order by ID
async function getOrderById(order_id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT user_id, order_date, total_amount, payment_type, status FROM CustOrder WHERE order_id = @order_id";
    const request = connection.request();
    request.input("order_id", sql.Int, order_id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Order not found
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

// Get all order of a user by user_id
async function getOrdersOfUser(user_id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = new sql.Request(connection);

    const query = `
    SELECT u.user_id, u.name, u.role, c.order_id, c.order_date, c.payment_type, c.status, c.total_amount
    FROM Users u LEFT JOIN CustOrder c ON u.user_id = c.user_id
    WHERE u.user_id = @user_id;
    `;

    request.input("user_id", sql.Int, user_id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // User not found
    }

    // Group the orders of user
    const UserWithOrders = {};
    for (const row of result.recordset) {
      const UserId = row.user_id;
      if (!UserWithOrders[UserId]) {
        UserWithOrders[UserId] = {
          user_id: UserId,
          name: row.name,
          role: row.role,
          orders: [],
        };
      }
      // Only add user if order_id is not null (for user with no orders)
      if (row.order_id !== null) {
        UserWithOrders[UserId].orders.push({
          order_id: row.order_id,
          order_date: row.order_date,
          payment_type: row.payment_type,
          total_amount: row.total_amount,
          status: row.status,
        });
      }
    }

    return Object.values(UserWithOrders);
  } catch (error) {
    console.error("Database error in getOrdersOfUser:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(
          "Error closing connection after getOrdersOfUser:",
          err
        );
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
    const request = new sql.Request(connection);

    const query = `
    SELECT s.stall_id, s.stall_name, s.status, mi.menu_item_id, mi.item_name, mi.description, mi.availability, mi.price
    FROM Stall s LEFT JOIN Menu m ON s.stall_id = m.menu_id
    LEFT JOIN MenuItem mi ON m.menu_id = mi.menu_id
    WHERE s.stall_id = @stall_id;
    `;

    request.input("stall_id", sql.Int, stall_id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Stall not found
    }

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

// Create an order
async function createOrder(CustOrder) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "INSERT INTO CustOrder (user_id, payment_type) VALUES (@user_id, @payment_type); SELECT SCOPE_IDENTITY() AS order_id;";
    const request = connection.request();
    request.input("user_id", CustOrder.user_id);
    request.input("payment_type", CustOrder.payment_type);
    const result = await request.query(query);

    const newOrderId = result.recordset[0].order_id;

    for (const item of CustOrder.items) {
      const priceQuery = "SELECT unit_price FROM MenuItem WHERE menu_item_id = @menu_item_id;";
      const priceRequest = connection.request();
      priceRequest.input("menu_item_id", sql.Int, item.menu_item_id);
      const priceResult = await priceRequest.query(priceQuery);
      
      const unitPrice = priceResult.recordset[0].unit_price;

      const itemQuery = `
        INSERT INTO OrderItem (order_id, menu_item_id, quantity, unit_price) 
        VALUES (@order_id, @menu_item_id, @quantity, @unit_price);
      `;
      const itemRequest = connection.request();
      itemRequest.input("order_id", sql.Int, newOrderId);
      itemRequest.input("menu_item_id", sql.Int, item.menu_item_id);
      itemRequest.input("quantity", sql.Int, item.quantity);
      itemRequest.input("unit_price", sql.Decimal(10,2), unitPrice);
      
      await itemRequest.query(itemQuery);
    }

    return await getOrderById(newOrderId);
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
  getOrderById,
  getOrdersOfUser,
  getHawkerCentresWithStalls,
  getMenuItemsOfStall,
  createOrder,
};