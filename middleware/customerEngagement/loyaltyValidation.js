const Joi = require("joi");

// Validation schema for redeeming a reward
const redeemSchema = Joi.object({
  user_id: Joi.number().integer().required().messages({
    "number.base": "user_id must be a number",
    "any.required": "user_id is required",
  }),
  reward_id: Joi.number().integer().required().messages({
    "number.base": "reward_id must be a number",
    "any.required": "reward_id is required",
  }),
});

// Validate redeem input
function validateRedeem(req, res, next) {
  const { error } = redeemSchema.validate(req.body, {
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

// Validate RedemptionID param
function validateRedemptionId(req, res, next) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid redemption ID. ID must be a positive number",
    });
  }

  next();
}

module.exports = {
  validateRedeem,
  validateRedemptionId,
};