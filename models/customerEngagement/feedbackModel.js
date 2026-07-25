// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Points awarded to a customer each time they submit feedback
const FEEDBACK_POINTS = 20;

// Get a customer's past orders that are eligible for feedback
async function getEligibleOrders(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT co.order_id, oi.stall_id, s.stall_name, co.order_date, mi.item_name, oi.quantity
      FROM CustOrder co
      JOIN OrderItem oi ON co.order_id = oi.order_id
      JOIN Stall s ON oi.stall_id = s.stall_id
      JOIN MenuItem mi ON oi.menu_item_id = mi.menu_item_id
      WHERE co.user_id = @userId
        AND co.order_id NOT IN (SELECT order_id FROM Feedback WHERE user_id = @userId)
      ORDER BY co.order_date DESC, co.order_id
    `;
    const request = connection.request();
    request.input("userId", userId);
    const result = await request.query(query);

    // One row per item comes back from SQL
    const orders = [];
    const orderPositions = {};
    result.recordset.forEach((row) => {
      if (orderPositions[row.order_id] === undefined) {
        orders.push({
          order_id: row.order_id,
          stall_id: row.stall_id,
          stall_name: row.stall_name,
          order_date: row.order_date,
          items: [],
        });
        orderPositions[row.order_id] = orders.length - 1;
      }
      orders[orderPositions[row.order_id]].items.push(`${row.item_name} x${row.quantity}`);
    });

    return orders;
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

// Create new feedback
async function createFeedback(feedback) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Prevent submitting feedback twice for the same order
    const checkRequest = connection.request();
    checkRequest.input("orderId", feedback.order_id);
    const checkResult = await checkRequest.query(
      "SELECT FeedbackID FROM Feedback WHERE order_id = @orderId"
    );
    if (checkResult.recordset.length > 0) {
      const error = new Error("Feedback has already been submitted for this order");
      error.status = 400;
      throw error;
    }

    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO Feedback (order_id, user_id, stall_id, Rating, Comment)
      VALUES (@order_id, @user_id, @stall_id, @Rating, @Comment);
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const request = connection.request();
    request.input("order_id", feedback.order_id);
    request.input("user_id", feedback.user_id);
    request.input("stall_id", feedback.stall_id);
    request.input("Rating", feedback.Rating);
    request.input("Comment", feedback.Comment || null);
    const result = await request.query(query);

    const newFeedbackId = result.recordset[0].id;

    // Award loyalty points for submitting feedback
    connection = await sql.connect(dbConfig);
    const pointsRequest = connection.request();
    pointsRequest.input("userId", feedback.user_id);
    pointsRequest.input("points", FEEDBACK_POINTS);
    await pointsRequest.query(
      "UPDATE LoyaltyPoints SET CurrentPoints = CurrentPoints + @points, LastUpdated = GETDATE() WHERE user_id = @userId"
    );

    return await getFeedbackById(newFeedbackId);
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

// Get a single feedback entry by ID
async function getFeedbackById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Feedback WHERE FeedbackID = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    return result.recordset[0] || null;
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

// Get all feedback submitted by a customer, newest first
async function getFeedbackByUser(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT f.FeedbackID, f.order_id, f.stall_id, s.stall_name, f.Rating, f.Comment, f.CreatedDate, f.UpdatedDate, mi.item_name, oi.quantity
      FROM Feedback f
      JOIN Stall s ON f.stall_id = s.stall_id
      JOIN OrderItem oi ON f.order_id = oi.order_id AND f.stall_id = oi.stall_id
      JOIN MenuItem mi ON oi.menu_item_id = mi.menu_item_id
      WHERE f.user_id = @userId
      ORDER BY f.CreatedDate DESC
    `;
    const request = connection.request();
    request.input("userId", userId);
    const result = await request.query(query);

    // One row per item comes back from SQL 
    const feedbackList = [];
    const feedbackPositions = {};
    result.recordset.forEach((row) => {
      if (feedbackPositions[row.FeedbackID] === undefined) {
        feedbackList.push({
          FeedbackID: row.FeedbackID,
          order_id: row.order_id,
          stall_id: row.stall_id,
          stall_name: row.stall_name,
          Rating: row.Rating,
          Comment: row.Comment,
          CreatedDate: row.CreatedDate,
          UpdatedDate: row.UpdatedDate,
          items: [],
        });
        feedbackPositions[row.FeedbackID] = feedbackList.length - 1;
      }
      feedbackList[feedbackPositions[row.FeedbackID]].items.push(`${row.item_name} x${row.quantity}`);
    });

    return feedbackList;
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

// Update feedback (rating and/or comment)
async function updateFeedback(id, updatedFeedback) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE Feedback
      SET Rating = @Rating, Comment = @Comment, UpdatedDate = GETDATE()
      WHERE FeedbackID = @id
    `;
    const request = connection.request();
    request.input("id", id);
    request.input("Rating", updatedFeedback.Rating);
    request.input("Comment", updatedFeedback.Comment || null);
    await request.query(query);

    return await getFeedbackById(id);
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

// Delete feedback and deduct the loyalty points that were awarded for it
async function deleteFeedback(id, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM Feedback WHERE FeedbackID = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return false;
    }

    // Deduct the points awarded for this feedback, without going below 0
    connection = await sql.connect(dbConfig);
    const pointsRequest = connection.request();
    pointsRequest.input("userId", userId);
    pointsRequest.input("points", FEEDBACK_POINTS);
    await pointsRequest.query(
      "UPDATE LoyaltyPoints SET CurrentPoints = CASE WHEN CurrentPoints - @points < 0 THEN 0 ELSE CurrentPoints - @points END, LastUpdated = GETDATE() WHERE user_id = @userId"
    );

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
  getEligibleOrders,
  createFeedback,
  getFeedbackById,
  getFeedbackByUser,
  updateFeedback,
  deleteFeedback,
  FEEDBACK_POINTS,
};