const Joi = require("joi");

// Validation schema for creating feedback
const createFeedbackSchema = Joi.object({
  order_id: Joi.number().integer().required().messages({
    "number.base": "order_id must be a number",
    "any.required": "order_id is required",
  }),
  user_id: Joi.number().integer().required().messages({
    "number.base": "user_id must be a number",
    "any.required": "user_id is required",
  }),
  stall_id: Joi.number().integer().required().messages({
    "number.base": "stall_id must be a number",
    "any.required": "stall_id is required",
  }),
  Rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.base": "Rating must be a number",
    "number.min": "Rating must be between 1 and 5",
    "number.max": "Rating must be between 1 and 5",
    "any.required": "Rating is required",
  }),
  Comment: Joi.string().max(500).allow("", null),
});

// Validation schema for updating feedback
const updateFeedbackSchema = Joi.object({
  Rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.base": "Rating must be a number",
    "number.min": "Rating must be between 1 and 5",
    "number.max": "Rating must be between 1 and 5",
    "any.required": "Rating is required",
  }),
  Comment: Joi.string().max(500).allow("", null),
});

// Validate create feedback input
function validateCreateFeedback(req, res, next) {
  const { error } = createFeedbackSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");

    return res.status(400).json({ error: errorMessage });
  }

  next();
}

// Validate update feedback input
function validateUpdateFeedback(req, res, next) {
  const { error } = updateFeedbackSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");

    return res.status(400).json({ error: errorMessage });
  }

  next();
}

// Validate FeedbackID param
function validateFeedbackId(req, res, next) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid feedback ID. ID must be a positive number",
    });
  }

  next();
}

module.exports = {
  validateCreateFeedback,
  validateUpdateFeedback,
  validateFeedbackId,
};