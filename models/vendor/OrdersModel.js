// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");
const { getOrderById } = require("../customer/customerModel");  //for update order status

//Get all orders that a stall received by stall_id
async function getOrdersOfStall(stall_id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = new sql.Request(connection);

    const query = `
        SELECT oi.stall_id, c.order_id, c.order_date, c.payment_type, c.status AS order_status, 
        c.total_amount AS order_total_amount, 
        u.user_id, u.name, 
        oi.order_item_no, oi.menu_item_id, oi.quantity, oi.unit_price
      FROM OrderItem oi
      INNER JOIN CustOrder c ON oi.order_id = c.order_id
      INNER JOIN Users u ON c.user_id = u.user_id
      WHERE oi.stall_id = @stall_id;
    `;

    request.input("stall_id", sql.Int, stall_id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; //no orders found for this stall.
    }
    //group the order items by order_id
    const OrdersWithItems = {};
    
    for (const row of result.recordset) {
      const orderId = row.order_id;
      
      if (!OrdersWithItems[orderId]) {
        OrdersWithItems[orderId] = {
          order_id: orderId,
          order_date: row.order_date,
          payment_type: row.payment_type,
          status: row.order_status,
          total_amount: row.order_total_amount,
          customer: {
            user_id: row.user_id,
            name: row.name
          },
          items: []
        };
      }
      OrdersWithItems[orderId].items.push({
        order_item_no: row.order_item_no,
        menu_item_id: row.menu_item_id,
        quantity: row.quantity,
        unit_price: row.unit_price
      });
    }

    return Object.values(OrdersWithItems);
  } catch (error) {
    console.error("Database error in getOrdersOfStall:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(
          "Error closing connection after getOrdersOfStall:",
          err
        );
      }
    }
  }
}

//PUT - Update CustOrder status to ('Preparing'/'Completed'/'Cancelled')
async function updateOrderStatus(order_id, newStatus) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const statusCheckQuery = "SELECT order_id, status FROM CustOrder WHERE order_id = @order_id;";
    const checkResult = await connection.request()
      .input("order_id", sql.Int, order_id)
      .query(statusCheckQuery);

    if (checkResult.recordset.length === 0) {
      throw new Error(`Order not found.`);
    }
    const currentStatus = checkResult.recordset[0].status;

    //conditions for different type of status updates.
    if (newStatus === 'Pending') {
      throw new Error("Cannot change status back to 'Pending'.");
    }

    if (currentStatus === 'Pending') {
      if (newStatus !== 'Preparing' && newStatus !== 'Cancelled') {
        throw new Error("Pending orders can only be changed to 'Preparing' or 'Cancelled'.");
      }
    } else if (currentStatus === 'Preparing') {
      if (newStatus !== 'Completed') {
        throw new Error("Preparing orders can only be changed to 'Completed'.");
      }
    } else if (currentStatus === 'Completed' || currentStatus === 'Cancelled') {
      throw new Error(`Cannot update order because it is already '${currentStatus}'.`);
    }

    const updateStatusQuery = "UPDATE CustOrder SET status = @newStatus WHERE order_id = @order_id;";
    await connection.request()
      .input("newStatus", sql.VarChar, newStatus)
      .input("order_id", sql.Int, order_id)
      .query(updateStatusQuery);

    return await getOrderById(order_id);
  } catch (error) {
    console.error("Database error in updateOrderStatus:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection after updateOrderStatus:", err);
      }
    }
  }
}

module.exports = {
  getOrdersOfStall,
  updateOrderStatus,
};