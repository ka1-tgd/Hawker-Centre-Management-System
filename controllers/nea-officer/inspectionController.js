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

module.exports = {
  getInspectionsByStall,
  createInspection,
};