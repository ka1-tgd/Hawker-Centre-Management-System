// Validate stallId query param (used by GET /vendor/satisfaction and GET /vendor/complaints)
function validateStallId(req, res, next) {
  const stallId = parseInt(req.query.stallId, 10);

  if (isNaN(stallId) || stallId <= 0) {
    return res.status(400).json({
      error: "Invalid stallId. stallId must be a positive number provided as a query param",
    });
  }

  next();
}

// Validate ComplaintID param (used by PUT /vendor/complaints/:id/resolve)
function validateComplaintId(req, res, next) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid complaint ID. ID must be a positive number",
    });
  }

  next();
}

module.exports = {
  validateStallId,
  validateComplaintId,
};