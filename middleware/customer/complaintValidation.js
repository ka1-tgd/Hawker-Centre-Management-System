const Joi = require("joi");

// Validation schema for creating a complaint (POST)
const complaintSchema = Joi.object({
  order_id: Joi.number().integer().required().messages({
    "number.base": "Order ID must be a number",
    "any.required": "Order ID is required",
  }),
  user_id: Joi.number().integer().required().messages({
    "number.base": "User ID must be a number",
    "any.required": "User ID is required",
  }),
  stall_id: Joi.number().integer().required().messages({
    "number.base": "Stall ID must be a number",
    "any.required": "Stall ID is required",
  }),
  category: Joi.string()
    .valid("Food Quality", "Wrong Order", "Price", "Long Waiting Time", "Hygiene")
    .required()
    .messages({
      "any.only": "Category must be one of: Food Quality, Wrong Order, Price, Long Waiting Time, Hygiene",
      "any.required": "Category is required",
    }),
  description: Joi.string().max(500).required().messages({
    "string.max": "Description cannot exceed 500 characters",
    "any.required": "Description is required",
  }),
});

// Validation schema for updating complaint status (PUT)
const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid("Pending", "In Progress", "Resolved", "Rejected")
    .required()
    .messages({
      "any.only": "Status must be one of: Pending, In Progress, Resolved, Rejected",
      "any.required": "Status is required",
    }),
});

// Middleware to validate complaint creation data
function validateComplaint(req, res, next) {
  const { error } = complaintSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

// Middleware to validate status update data
function validateStatusUpdate(req, res, next) {
  const { error } = statusUpdateSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

// Middleware to validate userId from URL parameters
function validateUserId(req, res, next) {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user ID. ID must be a positive number" });
  }

  next();
}

// Middleware to validate complaintId from URL parameters
function validateComplaintId(req, res, next) {
  const complaintId = parseInt(req.params.id);

  if (isNaN(complaintId) || complaintId <= 0) {
    return res.status(400).json({ error: "Invalid complaint ID. ID must be a positive number" });
  }

  next();
}

module.exports = {
  validateComplaint,
  validateStatusUpdate,
  validateUserId,
  validateComplaintId,
};