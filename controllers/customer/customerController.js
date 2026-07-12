// Require model and node modules
const customerModel = require("../../models/customer/customerModel");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Get all hawker centres
async function getAllHawkerCentres(req, res) {
    try {
        const hawkerCentres = await customerModel.getAllHawkerCentres();
        res.json(hawkerCentres);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving hawker centres" });
    }
}

// Get hawker centre by ID
async function getHawkerCentreById(req, res) {
  try {
    const id = parseInt(req.params.hawker_centre_id);
    const hawkerCentre = await customerModel.getHawkerCentreById(id);
    if (!hawkerCentre) {
      return res.status(404).json({ error: "Hawker centre not found" });
    }

    res.json(hawkerCentre);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving hawker centre" });
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

module.exports = {
    getAllHawkerCentres,
    getHawkerCentreById,
    getHawkerCentresWithStalls,
};