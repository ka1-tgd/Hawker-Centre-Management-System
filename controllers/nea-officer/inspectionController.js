// ============================================================
// Inspection Controller
// Receives HTTP requests for the Inspection Management feature,
// delegates the actual database work to inspectionModel, and
// sends back the appropriate HTTP response.
// ============================================================

const inspectionModel = require("../../models/nea-officer/inspectionModel");

// GET /nea/inspections/stall/:stallId
// Return every inspection recorded for one stall.
async function getInspectionsByStall(req, res) {
  try {
    const stallId = parseInt(req.params.stallId);
    const inspections = await inspectionModel.getInspectionsByStall(stallId);
    res.json(inspections);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving inspections" });
  }
}

// POST /nea/inspections
// Create a new inspection record. The model automatically works
// out and saves the resulting hygiene grade.
async function createInspection(req, res) {
  try {
    const newInspection = await inspectionModel.createInspection(req.body);
    res.status(201).json(newInspection);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating inspection" });
  }
}

// PUT /nea/inspections/:id
// Update the score/remarks of an inspection that was entered
// by mistake or needs correcting.
async function updateInspection(req, res) {
  try {
    const inspectionId = parseInt(req.params.id);
    const updated = await inspectionModel.updateInspection(inspectionId, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating inspection" });
  }
}

// DELETE /nea/inspections/:id
// Remove an inspection that was logged in error.
async function deleteInspection(req, res) {
  try {
    const inspectionId = parseInt(req.params.id);
    const deleted = await inspectionModel.deleteInspection(inspectionId);

    if (!deleted) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    res.json({ message: "Inspection deleted successfully" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting inspection" });
  }
}

// GET /nea/inspections/summary/grades
// Return the count of stalls currently holding each grade (A/B/C/D),
// used to draw the dashboard's grade distribution table.
async function getGradeDistribution(req, res) {
  try {
    const distribution = await inspectionModel.getGradeDistribution();
    res.json(distribution);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving grade distribution" });
  }
}

// GET /nea/inspections/summary/expiring
// Return stalls whose current grade will expire within 30 days.
async function getExpiringSoon(req, res) {
  try {
    const expiring = await inspectionModel.getExpiringSoon();
    res.json(expiring);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving expiring grades" });
  }
}

// GET /nea/inspections/summary/recent
// Return the 10 most recently logged inspections across all stalls.
async function getRecentInspections(req, res) {
  try {
    const recent = await inspectionModel.getRecentInspections();
    res.json(recent);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving recent inspections" });
  }
}
// GET /nea/stalls - list all stalls for the dropdown
async function getAllStalls(req, res) {
  try {
    const stalls = await inspectionModel.getAllStalls();
    res.json(stalls);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving stalls" });
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
  getAllStalls,
};