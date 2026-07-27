// Require model and node modules
const ordersModel = require("../../models/vendor/ordersModel");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//Get orders that a stall received by stall ID
async function getOrdersOfStall(req, res) {
  try {
    const stallId = parseInt(req.params.stall_id);
    const orders = await ordersModel.getOrdersOfStall(stallId);

    if (!orders) {
      return res.status(404).json({ error: "Stall not found" });
    }

    return res.json(orders);

  } catch (error) {
    console.error("Controller error in getOrdersOfStall:", error);
    return res.status(500).json({ error: "Error fetching orders" });
  }
}

//PUT - Update CustOrder status to ('Preparing'/'Completed'/'Cancelled')
async function updateOrderStatus(req, res) {
  const order_id = parseInt(req.params.order_id);
  const { status } = req.body;

  try {
    const updatedOrderStatus = await ordersModel.updateOrderStatus(order_id, status);
    return res.status(200).json(updatedOrderStatus);
  } catch (error) {
    if (error.message.includes("Order not found")) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message.includes("back to 'Pending'") ||
        error.message.includes("Pending orders can only be changed") ||
        error.message.includes("Preparing orders can only be changed") ||
        error.message.includes("Cannot update order")
    ) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Controller error in updateOrderStatus:", error);
    return res.status(500).json({ error: "An internal server error occurred while updating order status." });
  }
}

module.exports = {
  getOrdersOfStall,
  updateOrderStatus,
};