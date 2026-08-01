const vendorDashboardModel = require("../../models/customerEngagement/vendorDashboardModel.js");

// GET /vendor/satisfaction?stallId=xxx&page=1
async function getSatisfaction(req, res) {
  try {
    const stallId = parseInt(req.query.stallId);
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;

    const [ratingSummary, ratingBreakdown, recentFeedback, ratingTrend] = await Promise.all([
      vendorDashboardModel.getAverageRating(stallId),
      vendorDashboardModel.getRatingBreakdown(stallId),
      vendorDashboardModel.getRecentFeedback(stallId, page, pageSize),
      vendorDashboardModel.getRatingTrend(stallId),
    ]);

    res.json({
      averageRating: ratingSummary.avgRating,
      totalReviews: ratingSummary.totalReviews,
      ratingBreakdown,
      recentFeedback,
      page,
      ratingTrend,
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving satisfaction dashboard" });
  }
}

module.exports = {
  getSatisfaction,
};