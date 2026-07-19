const salesModel = require("../../models/vendor/salesModel");

// Get top-selling items for a stall
async function getPopularItems(req, res) {
  try {
    const stallId = parseInt(req.params.stallId);
    const items = await salesModel.getPopularItems(stallId);
    res.json(items);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving popular items" });
  }
}

// Get peak hours for a stall
async function getPeakHours(req, res) {
  try {
    const stallId = parseInt(req.params.stallId);
    const hours = await salesModel.getPeakHours(stallId);
    res.json(hours);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving peak hours" });
  }
}

// Get revenue summary for a stall
async function getRevenueSummary(req, res) {
  try {
    const stallId = parseInt(req.params.stallId);
    const summary = await salesModel.getRevenueSummary(stallId);
    res.json(summary);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving revenue summary" });
  }
}

module.exports = {
  getPopularItems,
  getPeakHours,
  getRevenueSummary,
};