// ============================================================
// Complaint Model
// Handles all database operations for the Complaint Management
// feature: submitting, viewing, updating the status of, and
// deleting complaints.
// ============================================================

const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Insert a new complaint submitted by a customer.
async function createComplaint(complaintData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO Complaint (order_id, user_id, stall_id, Category, Description)
      VALUES (@orderId, @userId, @stallId, @category, @description);
      SELECT SCOPE_IDENTITY() AS ComplaintID;
    `;
    const request = connection.request();
    request.input("orderId", complaintData.order_id);
    request.input("userId", complaintData.user_id);
    request.input("stallId", complaintData.stall_id);
    request.input("category", complaintData.category);
    request.input("description", complaintData.description);
    const result = await request.query(query);

    return { ComplaintID: result.recordset[0].ComplaintID };
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

// Get every complaint a specific customer has submitted, along
// with the name of the stall each complaint was made against.
async function getComplaintsByUser(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT c.ComplaintID, c.order_id, c.stall_id, s.stall_name,
             c.Category, c.Description, c.Status, c.CreatedDate, c.ResolvedDate
      FROM Complaint c
      INNER JOIN Stall s ON s.stall_id = c.stall_id
      WHERE c.user_id = @userId
      ORDER BY c.CreatedDate DESC
    `;
    const request = connection.request();
    request.input("userId", userId);
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

// Update a complaint's status (e.g. Pending -> In Progress -> Resolved).
// ResolvedDate is only stamped once the complaint reaches a final
// state (Resolved or Rejected).
async function updateComplaintStatus(complaintId, status) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE Complaint
      SET Status = @status,
          ResolvedDate = CASE WHEN @status IN ('Resolved', 'Rejected') THEN GETDATE() ELSE ResolvedDate END
      WHERE ComplaintID = @complaintId
    `;
    const request = connection.request();
    request.input("status", status);
    request.input("complaintId", complaintId);
    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
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

// Delete a complaint. Business rule: a customer may only delete
// their own complaint, and only while it is still "Pending" -
// once it is being processed, it must stay on record.
async function deleteComplaint(complaintId, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      DELETE FROM Complaint
      WHERE ComplaintID = @complaintId AND user_id = @userId AND Status = 'Pending'
    `;
    const request = connection.request();
    request.input("complaintId", complaintId);
    request.input("userId", userId);
    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
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
  createComplaint,
  getComplaintsByUser,
  updateComplaintStatus,
  deleteComplaint,
};