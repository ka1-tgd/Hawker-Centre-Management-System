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

// Update order
async function updateOrder(req, res) {
  try {
    const order_id = parseInt(req.params.order_id);
    const { order_items } = req.body;
    const updatedOrder = await customerModel.updateOrder(order_id, order_items);

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found or order status is no longer 'Pending'." });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Controller error:", error);
    if (error.message.includes("must belong to Stall") || error.message.includes("does not exist")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error updating order" });
  }
}

module.exports = {
  getOrderById,
  getOrdersOfUser,
  getHawkerCentresWithStalls,
  getMenuItemsOfStall,
  createOrder,
  updateOrder,
};