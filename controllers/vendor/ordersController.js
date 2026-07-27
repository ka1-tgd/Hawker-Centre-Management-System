// Require model and node modules
const ordersModel = require("../../models/vendor/ordersModel");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Get orders that a stall received by stall ID
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

module.exports = {
  getOrdersOfStall,
};