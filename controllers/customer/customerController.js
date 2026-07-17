// Require model and node modules
const customerModel = require("../../models/customer/customerModel");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Get order by ID
async function getOrderById(req, res) {
  try {
    const id = parseInt(req.params.order_id);
    const order = await customerModel.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving order" });
  }
}

// Get orders of a user by user ID
async function getOrdersOfUser(req, res) {
  try {
    const userId = parseInt(req.params.user_id);
    const orders = await customerModel.getOrdersOfUser(userId);

    if (!orders) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(orders);

  } catch (error) {
    console.error("Controller error in getOrdersOfUser:", error);
    return res.status(500).json({ error: "Error fetching user with orders" });
  }
}

// Get hawker centres with stalls
async function getHawkerCentresWithStalls(req, res) {
  try {
    const hawkerCentres = await customerModel.getHawkerCentresWithStalls();
    res.json(hawkerCentres);
  } catch (error) {
    console.error("Controller error in getHawkerCentresWithStalls:", error);
    res.status(500).json({ message: "Error fetching hawker centres with stalls" });
  }
}

// Get menu items of a stall by stall ID
async function getMenuItemsOfStall(req, res) {
  try {
    const stallId = parseInt(req.params.stall_id);
    const menuItems = await customerModel.getMenuItemsOfStall(stallId);

    if (!menuItems) {
      return res.status(404).json({ error: "Stall not found" });
    }

    return res.json(menuItems);

  } catch (error) {
    console.error("Controller error in getMenuItemsOfStall:", error);
    return res.status(500).json({ error: "Error fetching stall with menu items" });
  }
}

// Create new order
async function createOrder(req, res) {
  try {
    const newOrder = await customerModel.createOrder(req.body);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Controller error:", error);

    if (error.message && (
      error.message.includes("The stall is currently closed") ||
      error.message.includes("items are currently unavailable")
    )) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error creating order" });
  }
}

// Get order item by order_item_no
async function getOrderItemByNo(req, res) {
  try {
    const orderItemNo = parseInt(req.params.order_item_no);
    const orderItem = await customerModel.getOrderItemByNo(orderItemNo);
    if (!orderItem) {
      return res.status(404).json({ error: "Order item not found" });
    }

    res.json(orderItem);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving order item" });
  }
}

// Create a new order item in an existing order
async function createOrderItem(req, res) {
  try {
    const newOrderItem = await customerModel.createOrderItem(req.body);
    
    return res.status(201).json(newOrderItem);
  } catch (error) {
    console.error("Controller error in createOrderItem:", error);

    if (error.message.includes("Validation Error") || error.message.includes("Invalid menu_item_id")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "An internal server error occurred while adding the item." });
  }
}

// Update order item quantity
async function updateOrderItemQuantity(req, res) {
  const order_id = parseInt(req.params.order_id);
  const order_item_no = parseInt(req.params.order_item_no); // <-- Fixed variable name
  const { quantity } = req.body;

  try {
    const updatedOrder = await customerModel.updateOrderItemQuantity(order_id, order_item_no, quantity);

    if (!updatedOrder) {
      return res.status(404).json({ error: `Order ID ${order_id} not found.` });
    }
    return res.status(200).json(updatedOrder);
  } catch (error) {

    if (error.message.includes("update only available for status") || error.message.includes("is not part of Order ID")) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Controller error in updateOrderItemQuantity:", error);
    return res.status(500).json({ error: "An internal server error occurred while updating the item quantity." });
  }
}

module.exports = {
  getOrderById,
  getOrdersOfUser,
  getHawkerCentresWithStalls,
  getMenuItemsOfStall,
  createOrder,
  getOrderItemByNo,
  createOrderItem,
  updateOrderItemQuantity,
};