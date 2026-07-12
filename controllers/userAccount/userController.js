// Require model and node modules
const userModel = require("../../models/userAccount/userModel");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Get all users (for Postman Testing)
async function getAllUsers(req, res) {
    try {
        // Wait for model to get all users
        const users = await userModel.getAllUsers();

        // Return list of users in JSON
        res.json(users);
    } catch (error) {
        // Catch errors and log error message
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving users" });
    };
};

// Get user by ID
async function getUserByUsername(req, res) {
    try {
        // Get username from request
        const username = req.body.username;

        // Wait for model to get user
        const user = await userModel.getUserByUsername(username);

        // Check if user is found
        if (!user) {
            // If user not found
            return res.status(404).json({ error: "User not found" });
        };

        // Return user in JSON
        res.json(user);
    } catch (error) {
        // Catch errors and log error message
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error retrieving user" });
    };
};

// Create user
async function createUser(req, res) {
    try {
        // Check for existing username
        const existingUser = await userModel.getUserByUsername(req.body.username);
        if (existingUser) {
            // If username already exists, inform user
            return res.status(400).json({ message: "This username is already taken" });
        };

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Replace user-entered password as hashed password
        req.body.password = hashedPassword;

        // Wait for model to create user
        const newUser = await userModel.createUser(req.body);

        // Return new user in JSON
        res.status(201).json(newUser);
    } catch (error) {
        // Catch errors and log error message
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error creating user" });
    };
};

// Update user
async function updateUser(req, res) {    
    try {
        // Get ID and updated user data from request
        const userId = parseInt(req.params.id);
        const updatedUserData = req.body;

        // Check if userId is valid
        if (isNaN(userId)) {
            // If userId is not a number, send error message
            return res.status(400).send("Invalid user ID");
        };

        // Wait for model to update user details
        const updatedUser = await userModel.updateUser(userId, updatedUserData);

        // Check if user was updated
        if (!updatedUser) {
            // If user was not found and updated, send error message
            return res.status(404).send("User not found");
        };

        // Return updated user in JSON
        res.status(200).json(updatedUser);
    } catch (error) {
        // Catch errors and log error message
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error updating user" });
    };
};

// Delete user
async function deleteUser(req, res) {
    try {
        // Get user ID
        const userId = parseInt(req.params.id);

        // Check if ID is valid
        if (isNaN(userId)) {
            // If userId is not a number, send error message
            return res.status(400).send("Invalid user ID");
        };

        // Wait for model to delete user
        const deleted = await userModel.deleteUser(userId);

        // Check if user was found and deleted
        if (!deleted) {
            // If not found, send error message
            return res.status(404).send("User not found");
        };

        // Send success message
        res.status(200).send(`User with ID ${userId} was deleted successfully`);
    } catch (error) {
        // Catch errors and log error message
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error deleting user" });
    };
};

// Log in user
async function loginUser(req, res) {
    try {
        // Wait for model to get user
        const user = await userModel.getUserByUsername(req.body.username);

        // Check if user is found
        if (!user) {
            // If not found, send error message
            return res.status(401).json({ message: "Invalid credentials" });
        };

        // Compare entered password with hashed password
        const isMatch = await bcrypt.compare(req.body.password, user.passwordHash);

        // Check if passwords match
        if (!isMatch) {
            // If passwords do not match, send error message
            return res.status(401).json({ message: "Invalid credentials" });
        };

        // Generate JSON web token
        const payload = {
            id: user.user_id,
            role: user.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3600s"});

        // Return token in JSON
        return res.status(200).json({ token });
    } catch (error) {
        // Catch errors and log error message
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error logging in user" });
    };
};

// Export functions
module.exports = {
    getAllUsers,
    getUserByUsername,
    createUser,
    updateUser,
    deleteUser,
    loginUser
};