const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Calculate hygiene grade from score
function calculateGrade(score) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

// Get all inspections for a stall
async function getInspectionsByStall(stallId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT i.inspection_id, i.inspection_date, i.score, i.remarks, i.user_id,
             hg.grade, hg.valid_from, hg.expiry
      FROM Inspection i
      LEFT JOIN Hygiene_Grade hg ON hg.inspection_id = i.inspection_id
      WHERE i.stall_id = @stallId
      ORDER BY i.inspection_date DESC
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

// Create new inspection (and auto-generate hygiene grade)
async function createInspection(inspectionData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const insertQuery = `
      INSERT INTO Inspection (stall_id, user_id, inspection_date, score, remarks)
      VALUES (@stallId, @officerId, @inspectionDate, @score, @remarks);
      SELECT SCOPE_IDENTITY() AS inspection_id;
    `;
    const request = connection.request();
    request.input("stallId", inspectionData.stall_id);
    request.input("officerId", inspectionData.officer_id);
    request.input("inspectionDate", inspectionData.inspection_date);
    request.input("score", inspectionData.score);
    request.input("remarks", inspectionData.remarks || null);
    const result = await request.query(insertQuery);

    const newInspectionId = result.recordset[0].inspection_id;
    const grade = calculateGrade(inspectionData.score);

    const gradeQuery = `
      INSERT INTO Hygiene_Grade (grade, valid_from, expiry, stall_id, inspection_id)
      VALUES (@grade, @validFrom, DATEADD(MONTH, 12, @validFrom), @stallId, @inspectionId);
    `;
    const gradeRequest = connection.request();
    gradeRequest.input("grade", grade);
    gradeRequest.input("validFrom", inspectionData.inspection_date);
    gradeRequest.input("stallId", inspectionData.stall_id);
    gradeRequest.input("inspectionId", newInspectionId);
    await gradeRequest.query(gradeQuery);

    return { inspection_id: newInspectionId, grade: grade };
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

// Update inspection (and recalculate hygiene grade if score changed)
async function updateInspection(inspectionId, updateData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const updateInspectionQuery = `
      UPDATE Inspection
      SET score = @score, remarks = @remarks, updated_at = GETDATE()
      WHERE inspection_id = @inspectionId
    `;
    const request = connection.request();
    request.input("score", updateData.score);
    request.input("remarks", updateData.remarks || null);
    request.input("inspectionId", inspectionId);
    const result = await request.query(updateInspectionQuery);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    if (updateData.score !== undefined) {
      const newGrade = calculateGrade(updateData.score);

      const updateGradeQuery = `
        UPDATE Hygiene_Grade
        SET grade = @grade
        WHERE inspection_id = @inspectionId
      `;
      const gradeRequest = connection.request();
      gradeRequest.input("grade", newGrade);
      gradeRequest.input("inspectionId", inspectionId);
      await gradeRequest.query(updateGradeQuery);

      return { inspection_id: inspectionId, grade: newGrade };
    }

    return { inspection_id: inspectionId };
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

// Delete inspection (and its related hygiene grade record)
async function deleteInspection(inspectionId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const deleteGradeQuery = `
      DELETE FROM Hygiene_Grade WHERE inspection_id = @inspectionId
    `;
    const gradeRequest = connection.request();
    gradeRequest.input("inspectionId", inspectionId);
    await gradeRequest.query(deleteGradeQuery);

    const deleteInspectionQuery = `
      DELETE FROM Inspection WHERE inspection_id = @inspectionId
    `;
    const request = connection.request();
    request.input("inspectionId", inspectionId);
    const result = await request.query(deleteInspectionQuery);

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

// Get grade distribution across all stalls (uses each stall's most recent grade)
async function getGradeDistribution() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT hg.grade, COUNT(*) AS count
      FROM Hygiene_Grade hg
      INNER JOIN (
        SELECT stall_id, MAX(valid_from) AS max_valid_from
        FROM Hygiene_Grade
        GROUP BY stall_id
      ) latest ON hg.stall_id = latest.stall_id AND hg.valid_from = latest.max_valid_from
      GROUP BY hg.grade
    `;
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

// Get stalls whose current grade is expiring within the next 30 days
async function getExpiringSoon() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT s.stall_id, s.stall_name, hg.grade, hg.expiry
      FROM Hygiene_Grade hg
      INNER JOIN (
        SELECT stall_id, MAX(valid_from) AS max_valid_from
        FROM Hygiene_Grade
        GROUP BY stall_id
      ) latest ON hg.stall_id = latest.stall_id AND hg.valid_from = latest.max_valid_from
      INNER JOIN Stall s ON s.stall_id = hg.stall_id
      WHERE hg.expiry BETWEEN GETDATE() AND DATEADD(DAY, 30, GETDATE())
      ORDER BY hg.expiry ASC
    `;
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

// Get the 10 most recent inspections across all stalls
async function getRecentInspections() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT TOP 10 i.inspection_id, i.inspection_date, i.score, i.user_id,
             s.stall_name, hg.grade
      FROM Inspection i
      INNER JOIN Stall s ON s.stall_id = i.stall_id
      LEFT JOIN Hygiene_Grade hg ON hg.inspection_id = i.inspection_id
      ORDER BY i.inspection_date DESC
    `;
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
  getInspectionsByStall,
  createInspection,
  updateInspection,
  deleteInspection,
  getGradeDistribution,
  getExpiringSoon,
  getRecentInspections,
};