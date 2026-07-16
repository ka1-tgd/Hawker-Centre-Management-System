const vendorDashboardModel = require("../../models/customerEngagement/vendorDashboardModel.js");

// GET /vendor/satisfaction?stallId=xxx&page=1
async function getSatisfaction(req, res) {
  try {
    const stallId = parseInt(req.query.stallId);
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;

    const [ratingSummary, ratingBreakdown, recentFeedback, ratingTrend, complaintSummary] = await Promise.all([
      vendorDashboardModel.getAverageRating(stallId),
      vendorDashboardModel.getRatingBreakdown(stallId),
      vendorDashboardModel.getRecentFeedback(stallId, page, pageSize),
      vendorDashboardModel.getRatingTrend(stallId),
      vendorDashboardModel.getComplaintSummary(stallId),
    ]);

    res.json({
      averageRating: ratingSummary.avgRating,
      totalReviews: ratingSummary.totalReviews,
      ratingBreakdown,
      recentFeedback,
      page,
      ratingTrend,
      complaintSummary,
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving satisfaction dashboard" });
  }
}

// GET /vendor/complaints?stallId=xxx&status=open
async function getComplaints(req, res) {
  try {
    const stallId = parseInt(req.query.stallId);
    const status = req.query.status || null;

    const complaints = await vendorDashboardModel.getComplaints(stallId, status);
    res.json(complaints);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving complaints" });
  }
}

// PUT /vendor/complaints/:id/resolve
async function resolveComplaint(req, res) {
  try {
    const id = parseInt(req.params.id);
    const resolved = await vendorDashboardModel.resolveComplaint(id);

    if (!resolved) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json({ message: "Complaint marked as resolved" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error resolving complaint" });
  }
}

module.exports = {
  getSatisfaction,
  getComplaints,
  resolveComplaint,
};