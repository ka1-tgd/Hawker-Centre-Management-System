const Joi = require("joi"); // Import Joi for validation

// Validation schema for create order item (for POST /items)
const createOrderItemSchema = Joi.object({
  order_id: Joi.number().integer().positive().required().messages({
    "number.base": "order_id must be an integer",
    "number.positive": "order_id must be a positive number",
    "any.required": "order_id is required"
  }),
  menu_item_id: Joi.number().integer().positive().required().messages({
    "number.base": "menu_item_id must be an integer",
    "number.positive": "menu_item_id must be a positive integer",
    "any.required": "menu_item_id is required"
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "quantity must be a number",
    "number.min": "quantity must be at least 1",
    "any.required": "quantity is required"
  })
});

// Validation schema for individual order item update (for PUT)
const orderItemQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "quantity must be a number",
    "number.min": "quantity must be at least 1",
    "any.required": "quantity is required"
  })
});

// Validation schema for orders (used for POST)
const orderSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    "number.base": "user_id must be a integer",
    "number.positive": "user_id must be a positive number",
    "any.required": "user_id is required"
  }),
  payment_type: Joi.string().valid('Card', 'PayNow', 'Cash').required().messages({
    "string.base": "payment_type must be a string",
    "string.empty": "payment_type cannot be empty",
    "any.only": "payment_type can only be either 'Cash', 'Card' or 'PayNow'",
    "any.required": "payment_type is required",
  }),
  order_items: Joi.array().items(
    Joi.object({
      menu_item_id: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required().messages({
    "array.min": "Your order must contain at least one item.",
    "any.required": "Order items are required."
  })
});

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

// Validate user ID from URL parameters (for GET by ID, PUT, DELETE)
function validateUserIdForCustomer(req, res, next) {
  const id = parseInt(req.params.user_id);

  if (isNaN(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid user ID. ID must be a positive number" });
  }
  next();
}

// Middleware to validate stall ID from URL parameters (for GET by ID, PUT, DELETE)
function validateStallIdForCustomer(req, res, next) {
  const id = parseInt(req.params.stall_id);

  if (isNaN(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid stall ID. ID must be a positive number" });
  }
  next();
}

// Validate order data (for POST/PUT)
function validateOrder(req, res, next) {
  const { error } = orderSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }
  next();
}

// Validate order item No from URL parameters (for GET by ID, PUT, DELETE)
function validateOrderItemNo(req, res, next) {
  const id = parseInt(req.params.order_item_no);

  if (isNaN(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid order item number. order item number must be a positive number" });
  }
  next();
}

// Validate create order item (for POST)
function validateCreateOrderItem(req, res, next) {
  const { error } = createOrderItemSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }
  next();
}

// Validate updated order item quantity (for PUT)
function validateOrderItemQuantity(req, res, next) {
  const { error } = orderItemQuantitySchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }
  next();
}

module.exports = {
  validateOrderId,
  validateUserIdForCustomer,
  validateStallIdForCustomer,
  validateOrder,
  validateOrderItemNo,
  validateCreateOrderItem,
  validateOrderItemQuantity,
};