// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Average rating and total review count for one stall
async function getAverageRating(stallId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT AVG(CAST(Rating AS FLOAT)) AS avgRating, COUNT(*) AS totalReviews
      FROM Feedback
      WHERE stall_id = @stallId
    `;
    const request = connection.request();
    request.input("stallId", stallId);
    const result = await request.query(query);

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

// How many 1-star, 2-star, etc. reviews this stall has
async function getRatingBreakdown(stallId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT Rating, COUNT(*) AS count
      FROM Feedback
      WHERE stall_id = @stallId
      GROUP BY Rating
    `;
    const request = connection.request();
    request.input("stallId", stallId);
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

// Paginated recent feedback, newest first
async function getRecentFeedback(stallId, page, pageSize) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const offset = (page - 1) * pageSize;
    const query = `
      SELECT f.FeedbackID, f.Rating, f.Comment, f.CreatedDate, u.name AS customerName
      FROM Feedback f
      JOIN Users u ON f.user_id = u.user_id
      WHERE f.stall_id = @stallId
      ORDER BY f.CreatedDate DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `;
    const request = connection.request();
    request.input("stallId", stallId);
    request.input("offset", offset);
    request.input("pageSize", pageSize);
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

// Average rating per day for the last 30 days
async function getRatingTrend(stallId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT CAST(CreatedDate AS DATE) AS feedbackDate, AVG(CAST(Rating AS FLOAT)) AS avgRating
      FROM Feedback
      WHERE stall_id = @stallId AND CreatedDate >= DATEADD(DAY, -30, GETDATE())
      GROUP BY CAST(CreatedDate AS DATE)
      ORDER BY feedbackDate ASC
    `;
    const request = connection.request();
    request.input("stallId", stallId);
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

// Open complaint count broken down by category
// (complaint SUBMISSION is a teammate's feature - this dashboard only reads
// and can mark complaints resolved, per the SCRUM-72 assumption)
async function getComplaintSummary(stallId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT Category, COUNT(*) AS count
      FROM Complaint
      WHERE stall_id = @stallId AND Status IN ('Pending', 'In Progress')
      GROUP BY Category
    `;
    const request = connection.request();
    request.input("stallId", stallId);
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

// List of complaints for a stall, optionally filtered by status
// status "open" is shorthand for Pending + In Progress combined
async function getComplaints(stallId, status) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("stallId", stallId);

    let query = `
      SELECT ComplaintID, order_id, Category, Description, Status, CreatedDate, ResolvedDate
      FROM Complaint
      WHERE stall_id = @stallId
    `;

    if (status === "open") {
      query += " AND Status IN ('Pending', 'In Progress')";
    } else if (status) {
      query += " AND Status = @status";
      request.input("status", status);
    }

    query += " ORDER BY CreatedDate DESC";

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

// Mark a complaint as resolved
async function resolveComplaint(complaintId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      UPDATE Complaint
      SET Status = 'Resolved', ResolvedDate = GETDATE()
      WHERE ComplaintID = @complaintId
    `;
    const request = connection.request();
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

module.exports = {
  getAverageRating,
  getRatingBreakdown,
  getRecentFeedback,
  getRatingTrend,
  getComplaintSummary,
  getComplaints,
  resolveComplaint,
};