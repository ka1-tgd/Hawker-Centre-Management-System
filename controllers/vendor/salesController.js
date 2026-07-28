// ============================================================
// Sales Controller
// Receives HTTP requests for the Sales Analytics Dashboard
// feature and delegates the work to salesModel.
// ============================================================

const salesModel = require("../../models/vendor/salesModel");

// GET /vendor/sales/:stallId/popular-items
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

// GET /vendor/sales/:stallId/peak-hours
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

// GET /vendor/sales/:stallId/revenue
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

// GET /vendor/sales/:stallId/chart
// Returns a QuickChart image URL of the stall's top-selling items.
async function getPopularItemsChart(req, res) {
  try {
    const stallId = parseInt(req.params.stallId);
    const chartUrl = await salesModel.generatePopularItemsChart(stallId);
    res.json({ chartUrl });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error generating chart" });
  }
}

module.exports = {
  getPopularItems,
  getPeakHours,
  getRevenueSummary,
  getPopularItemsChart,
};