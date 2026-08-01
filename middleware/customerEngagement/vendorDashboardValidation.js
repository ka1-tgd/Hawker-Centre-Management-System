// Validate stallId query param (used by GET /vendor/satisfaction)
function validateStallId(req, res, next) {
  const stallId = parseInt(req.query.stallId, 10);

  if (isNaN(stallId) || stallId <= 0) {
    return res.status(400).json({
      error: "Invalid stallId. stallId must be a positive number provided as a query param",
    });
  }

  next();
}

module.exports = {
  validateStallId,
};