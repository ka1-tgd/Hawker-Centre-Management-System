const Joi = require("joi");
 
// Validation schema for creating a like
const createLikeSchema = Joi.object({
  user_id: Joi.number().integer().required().messages({
    "number.base": "user_id must be a number",
    "any.required": "user_id is required",
  }),
  menu_item_id: Joi.number().integer().required().messages({
    "number.base": "menu_item_id must be a number",
    "any.required": "menu_item_id is required",
  }),
});
 
// Validate create like input
function validateCreateLike(req, res, next) {
  const { error } = createLikeSchema.validate(req.body, {
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
 
// Validate LikeID param
function validateLikeId(req, res, next) {
  const id = parseInt(req.params.id, 10);
 
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid like ID. ID must be a positive number",
    });
  }
 
  next();
}
 
module.exports = {
  validateCreateLike,
  validateLikeId,
};