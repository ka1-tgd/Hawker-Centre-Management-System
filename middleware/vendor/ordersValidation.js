const Joi = require("joi"); // Import Joi for validation


// Validate stall ID from URL parameters (for GET by ID, PUT, DELETE)
function validateStallIdForHawker(req, res, next) {
  const id = parseInt(req.params.stall_id);

  if (isNaN(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid stall ID. ID must be a positive number" });
  }
  next();
}

module.exports = {
  validateStallIdForHawker,
};