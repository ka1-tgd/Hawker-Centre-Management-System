const Joi = require("joi"); // Import Joi for validation

// Middleware to validate order ID from URL parameters (for GET by ID, PUT, DELETE)
function validateOrderId(req, res, next) {
  // Parse the ID from request parameters
  const id = parseInt(req.params.order_id);

  // Check if the parsed ID is a valid positive number
  if (isNaN(id) || id <= 0) {
    // If not valid, send a 400 response
    return res
      .status(400)
      .json({ error: "Invalid order ID. ID must be a positive number" });
  }

  // If validation succeeds, pass control to the next middleware/route handler
  next();
}

// Middleware to validate stall ID from URL parameters (for GET by ID, PUT, DELETE)
function validateStallIdForCustomer(req, res, next) {
  // Parse the ID from request parameters
  const id = parseInt(req.params.stall_id);

  // Check if the parsed ID is a valid positive number
  if (isNaN(id) || id <= 0) {
    // If not valid, send a 400 response
    return res
      .status(400)
      .json({ error: "Invalid stall ID. ID must be a positive number" });
  }

  // If validation succeeds, pass control to the next middleware/route handler
  next();
}

module.exports = {
  validateOrderId,
  validateStallIdForCustomer,
};