const Joi = require("joi"); // Import Joi for validation

// Validation schema for order status update (for PUT)
const orderStatusSchema = Joi.object({
  status: Joi.string().valid("Preparing", "Completed", "Cancelled").required()
    .messages({
      "string.base": "Status must be a text value.",
      "any.only": "Status must be either 'Preparing', 'Completed', or 'Cancelled'.",
      "any.required": "Status is required."
    })
});

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

// Validate updated order status (for PUT)
function validateOrderStatus(req, res, next) {
  const { error } = orderStatusSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }
  next();
}

module.exports = {
  validateStallIdForHawker,
  validateOrderStatus,
};