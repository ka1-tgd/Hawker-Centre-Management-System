const Joi = require("joi");

// Validation schema for Stall
const stallSchema = Joi.object({
    hawker_centre_id: Joi.number().integer().positive().required().messages({         
        "number.base": "ID must be a number",         
        "number.integer": "ID must be an integer",         
        "number.positive": "ID must be a positive number",         
        "any.required": "ID is required"}),
    stall_name: Joi.string().min(1).max(100).required().messages({
        "string.base": "Stall name must be a string",
        "string.empty": "Stall name cannot be empty",
        "string.max": "Stall name cannot be more than 100 characters",
        "any.required": "Stall name is required"}),
    operating_hours: Joi.string().max(100).required().messages({
        "string.base": "Operating hours must be a string",
        "string.empty": "Operating hours cannot be empty",
        "string.max": "Operating hours cannot be more tha 100 characters",
        "any.required": "Operating hours is required"}),
    description: Joi.string().max(255).required().messages({         
        "string.base": "Description must be a string",         
        "string.empty": "Description cannot be empty",         
        "string.max": "Description cannot be more than 255 characters",         
        "any.required": "Description is required"}),
    contact_number: Joi.string()
        .pattern(/^[0-9]{8}$/)
        .required()
        .messages({
            "string.pattern.base": "Contact number must be 8 digits",
            "any.required": "Contact number is required"}),
    status: Joi.string()
        .valid("Open", "Close")
        .required()
        .messages({
            "any.only": "Status can only be either open or close",
            "any.required": "Status is required"})
});
function validateStall(req, res, next) {
    const { error } = stallSchema.validate(req.body, {
        abortEarly: false
    });
    if (error) {
        const errorMessage = error.details
            .map(detail => detail.message)
            .join(", ");
        return res.status(400).json({
            error: errorMessage
        });
    }
    next();
}

function validateStallId(req, res, next) {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid Stall ID. ID must be a positive number."
        });
    }
    next();
}

module.exports = {
    validateStall,
    validateStallId
};