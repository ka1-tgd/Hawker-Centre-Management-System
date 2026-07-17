// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get Order by ID
async function getOrderById(order_id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = new sql.Request(connection);

    const query = `
    SELECT c.order_id, c.user_id, c.order_date, c.total_amount, c.payment_type, c.status, o.order_item_no, o.stall_id, mi.item_name, o.quantity, o.unit_price
    FROM CustOrder c 
    LEFT JOIN OrderItem o ON c.order_id = o.order_id
    LEFT JOIN MenuItem mi ON mi.menu_item_id = o.menu_item_id
    WHERE c.order_id = @order_id;
    `;

    request.input("order_id", sql.Int, order_id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Order not found
    }

    // Group the order items for an order
    const OrderItemsOfOrder = {};
    for (const row of result.recordset) {
      const OrderId = row.order_id;
      if (!OrderItemsOfOrder[OrderId]) {
        OrderItemsOfOrder[OrderId] = {
          order_id: OrderId,
          user_id: row.user_id,
          order_date: row.order_date,
          total_amount: row.total_amount,
          payment_type: row.payment_type,
          status: row.status,
          order_items: [],
        };
      }
      // Only add order item if order_item_no is not null (for order with no order items)
      if (row.order_item_no !== null) {
        OrderItemsOfOrder[OrderId].order_items.push({
          order_item_no: row.order_item_no,
          item_name: row.item_name,
          stall_id: row.stall_id,
          quantity: row.quantity,
          unit_price: row.unit_price,
        });
      }
    }

    return Object.values(OrderItemsOfOrder);
  } catch (error) {
    console.error("Database error in getOrderById:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(
          "Error closing connection after getOrderedById:",
          err
        );
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
    LEFT JOIN Stall s ON h.hawker_centre_id = s.hawker_centre_id
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
    FROM Stall s LEFT JOIN Menu m ON s.stall_id = m.stall_id
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
          description: row.description,
          price: row.price,
          availability: row.availability,
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
    const validatedItems = [];
    for (const item of CustOrder.order_items) {
      const itemInfoQuery = `
      SELECT mi.price, mi.availability, m.stall_id, s.status
      FROM MenuItem mi
      INNER JOIN Menu m ON mi.menu_id = m.menu_id
      INNER JOIN Stall s ON m.stall_id = s.stall_id
      WHERE mi.menu_item_id = @menu_item_id;
      `;
      const infoRequest = connection.request();
      infoRequest.input("menu_item_id", sql.Int, item.menu_item_id);
      const infoResult = await infoRequest.query(itemInfoQuery);

      const unitPrice = infoResult.recordset[0].price;
      const itemAvailability = infoResult.recordset[0].availability;
      const stallId = infoResult.recordset[0].stall_id;
      const stallStatus = infoResult.recordset[0].status;

      if (!stallStatus || stallStatus.toLowerCase() !== 'open') {   
        throw new Error(`Cannot place order: The stall is currently closed.`);
      }
      if (!itemAvailability || itemAvailability.toUpperCase() !== 'Y') {  
        throw new Error(`Cannot place order: One or more items are currently unavailable.`);
      }

      validatedItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        stall_id: stallId,
        item_total: item.quantity * unitPrice
      });
    }

    const query =
      "INSERT INTO CustOrder (user_id, payment_type) VALUES (@user_id, @payment_type); SELECT SCOPE_IDENTITY() AS order_id;";
    const request = connection.request();
    request.input("user_id", CustOrder.user_id);
    request.input("payment_type", CustOrder.payment_type);
    const result = await request.query(query);

    const newOrderId = result.recordset[0].order_id;
    let totalAmount = 0;
    for (const item of validatedItems) {
      totalAmount += item.item_total;

      const itemQuery = `
        INSERT INTO OrderItem (order_id, menu_item_id, quantity, unit_price, stall_id) 
        VALUES (@order_id, @menu_item_id, @quantity, @unit_price, @stall_id);
      `;

      const itemRequest = connection.request();
      itemRequest.input("order_id", sql.Int, newOrderId);
      itemRequest.input("menu_item_id", sql.Int, item.menu_item_id);
      itemRequest.input("quantity", sql.Int, item.quantity);
      itemRequest.input("unit_price", sql.Decimal(10,2), item.unitPrice);
      itemRequest.input("stall_id", sql.Int, item.stall_id);
      await itemRequest.query(itemQuery);
    }

    const updateOrderQuery = 
    `UPDATE CustOrder SET total_amount = @total_amount WHERE order_id = @order_id;`;
    const updateRequest = connection.request();
    updateRequest.input("order_id", sql.Int, newOrderId);
    updateRequest.input("total_amount", sql.Decimal(10,2), totalAmount);
    await updateRequest.query(updateOrderQuery);

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

//-----------------------------order items-----------------------------//

// get order item by order_item_no
async function getOrderItemByNo(order_item_no) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT order_item_no, order_id, stall_id, menu_item_id, quantity, unit_price FROM OrderItem WHERE order_item_no = @order_item_no";
    const request = connection.request();
    request.input("order_item_no", order_item_no);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Order Item not found
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

// create order item
async function createOrderItem(orderItemData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = 
        "INSERT INTO OrderItem (order_id, menu_item_id, quantity, unit_price, stall_id) VALUES (@order_id, @menu_item_id, @quantity, @unit_price, @stall_id); SELECT SCOPE_IDENTITY() AS order_item_no";
    const request = connection.request();
    request.input("order_id", sql.Int, orderItemData.order_id);
    request.input("menu_item_id", sql.Int, orderItemData.menu_item_id);
    request.input("quantity", sql.Int, orderItemData.quantity);
    request.input("unit_price", sql.Decimal(10,2), orderItemData.unit_price);
    request.input("stall_id", sql.Int, orderItemData.stall_id);
    const result = await request.query(query);

    const newOrderItemNo = result.recordset[0].order_item_no;
    return await getOrderItemByNo(newOrderItemNo);
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

// Update order item quantity
async function updateOrderItemQuantity(order_id, order_item_no, newQuantity) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const statusCheckQuery = `
      SELECT co.status, oi.menu_item_id
      FROM CustOrder co
      INNER JOIN OrderItem oi ON co.order_id = oi.order_id
      WHERE co.order_id = @order_id AND oi.order_item_no = @order_item_no;
    `;
    const checkResult = await connection.request()
      .input("order_id", sql.Int, order_id)
      .input("order_item_no", sql.Int, order_item_no)
      .query(statusCheckQuery);

    if (checkResult.recordset.length === 0) {
      throw new Error(`Item No ${order_item_no} is not part of Order ID ${order_id}, or the order does not exist.`);
    }

    const currentStatus = checkResult.recordset[0].status;
    if (currentStatus !== 'Pending') {
      throw new Error(`Order status is '${currentStatus}', update only available for status 'Pending'.`);
    }

    const updateItemQuery = `
      UPDATE OrderItem
      SET quantity = @quantity
      WHERE order_id = @order_id AND order_item_no = @order_item_no;
    `;
    await connection.request()
      .input("quantity", sql.Int, newQuantity)
      .input("order_id", sql.Int, order_id)
      .input("order_item_no", sql.Int, order_item_no)
      .query(updateItemQuery);

    const updateParentTotalQuery = `
      UPDATE CustOrder
      SET total_amount = ISNULL((SELECT SUM(quantity * unit_price) FROM OrderItem WHERE order_id = @order_id), 0)
      WHERE order_id = @order_id;
    `;
    await connection.request()
      .input("order_id", sql.Int, order_id)
      .query(updateParentTotalQuery);

    return await getOrderById(order_id);
  } catch (error) {
    console.error("Database error in updateOrderItemQuantity:", error);
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

// delete orderitem
// update order : status
// delete order : status

module.exports = {
  getOrderById,
  getOrdersOfUser,
  getHawkerCentresWithStalls,
  getMenuItemsOfStall,
  createOrder,
  getOrderItemByNo,
  createOrderItem,
  updateOrderItemQuantity,
};