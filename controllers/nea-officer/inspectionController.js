const inspectionModel = require("../../models/nea-officer/inspectionModel");

// Get all inspections for a stall
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

// Create new inspection
async function createInspection(req, res) {
  try {
    const newInspection = await inspectionModel.createInspection(req.body);
    res.status(201).json(newInspection);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating inspection" });
  }
}

// Update an inspection
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

// Delete an inspection
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

module.exports = {
  getInspectionsByStall,
  createInspection,
  updateInspection,
  deleteInspection,
};