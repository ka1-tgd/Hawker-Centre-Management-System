// Middleware to validate stallId from URL parameters
function validateStallId(req, res, next) {
  const stallId = parseInt(req.params.stallId);

  if (isNaN(stallId) || stallId <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid stall ID. ID must be a positive number" });
  }

  next();
}

module.exports = {
  validateStallId,
};