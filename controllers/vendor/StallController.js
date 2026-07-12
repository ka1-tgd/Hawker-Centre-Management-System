const stallModel = require("../../models/vendor/StallModel.js")
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// GET vendor stall (based on user)
async function getLoginUserStalls(req, res) {

    try {
        const userId = 1;
        const stalls = await stallModel.getLoginUserStalls(userId);
        res.json(stalls);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            error: "Error retrieving stalls"
        });
    }
}

// get stall by ID
async function getStallById(req, res) {
    try {
        const stallId = parseInt(req.params.id);
        const userId = 1;
        const stall = await stallModel.getStallById(stallId, userId);
        if (!stall) {
            return res.status(404).json({
                error: "Stall not found"
            });
        }
        res.json(stall);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            error: "Error retrieving stall"
        });

    }

}

// create stall
async function createStall(req, res) {
    try {
        const userId = 1;
        const newStall = await stallModel.createStall(userId, req.body);
        res.status(201).json(newStall);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            error: "Error creating stall"
        });
    }

}

//  update stall
async function updateStall(req, res) {
    try {
        const stallId = parseInt(req.params.id);
        const userId = 1;
        const updatedStall = await stallModel.updateStall(
            stallId,
            userId,
            req.body
        );
        if (!updatedStall) {
            return res.status(404).json({
                error: "Stall not found"
            });
        }
        res.json(updatedStall);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            error: "Error updating stall"
        });
    }
}

// delete stall
async function deleteStall(req, res) {
    try {
        const stallId = parseInt(req.params.id);
        const userId = 1;
        const deleted = await stallModel.deleteStall(
            stallId,
            userId
        );
        if (!deleted) {

            return res.status(404).json({
                error: "Stall not found"
            });
        }
        res.json({
            message: "Stall deleted successfully"
        });
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            error: "Error deleting stall"
        });
    }
}

module.exports = {
    getLoginUserStalls,
    getStallById,
    createStall,
    updateStall,
    deleteStall
};