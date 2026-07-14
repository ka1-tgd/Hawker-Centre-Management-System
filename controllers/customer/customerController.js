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

module.exports = {
  getOrderById,
  getHawkerCentresWithStalls,
  getMenuItemsOfStall,
};