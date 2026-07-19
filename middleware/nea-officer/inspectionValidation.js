const Joi = require("joi");

// Validation schema for creating an inspection (POST)
const inspectionSchema = Joi.object({
  stall_id: Joi.number().integer().required().messages({
    "number.base": "Stall ID must be a number",
    "any.required": "Stall ID is required",
  }),
  officer_id: Joi.number().integer().required().messages({
    "number.base": "Officer ID must be a number",
    "any.required": "Officer ID is required",
  }),
  inspection_date: Joi.date().required().messages({
    "date.base": "Inspection date must be a valid date",
    "any.required": "Inspection date is required",
  }),
  score: Joi.number().integer().min(0).max(100).required().messages({
    "number.base": "Score must be a number",
    "number.min": "Score cannot be below 0",
    "number.max": "Score cannot exceed 100",
    "any.required": "Score is required",
  }),
  remarks: Joi.string().allow("").max(500).messages({
    "string.max": "Remarks cannot exceed 500 characters",
  }),
});

// Validation schema for updating an inspection (PUT) - fields optional
const inspectionUpdateSchema = Joi.object({
  score: Joi.number().integer().min(0).max(100).messages({
    "number.base": "Score must be a number",
    "number.min": "Score cannot be below 0",
    "number.max": "Score cannot exceed 100",
  }),
  remarks: Joi.string().allow("").max(500).messages({
    "string.max": "Remarks cannot exceed 500 characters",
  }),
});

// Middleware to validate inspection data (for POST)
function validateInspection(req, res, next) {
  const { error } = inspectionSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

// Middleware to validate inspection update data (for PUT)
function validateInspectionUpdate(req, res, next) {
  const { error } = inspectionUpdateSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

// Middleware to validate stallId from URL parameters (for GET)
function validateStallId(req, res, next) {
  const stallId = parseInt(req.params.stallId);

  if (isNaN(stallId) || stallId <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid stall ID. ID must be a positive number" });
  }

  next();
}

// Middleware to validate inspectionId from URL parameters (for PUT and DELETE)
function validateInspectionId(req, res, next) {
  const inspectionId = parseInt(req.params.id);

  if (isNaN(inspectionId) || inspectionId <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid inspection ID. ID must be a positive number" });
  }

  next();
}

module.exports = {
  validateInspection,
  validateInspectionUpdate,
  validateStallId,
  validateInspectionId,
};