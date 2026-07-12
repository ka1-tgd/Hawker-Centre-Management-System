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

    // Insert inspection record
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

    // Insert hygiene grade record (valid for 12 months from inspection date)
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

module.exports = {
  getInspectionsByStall,
  createInspection,
};