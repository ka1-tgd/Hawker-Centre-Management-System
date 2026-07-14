// Require express, mssql, dotenv and path
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");
console.log("DB_SERVER is:", process.env.DB_SERVER);

// Load environment variables
dotenv.config();

// Require contollers
const customerController = require("./controllers/customer/customerController.js");
const inspectionController = require("./controllers/nea-officer/inspectionController");
const userController = require("./controllers/userAccount/userController.js");
const stallController = require("./controllers/vendor/stallController.js");

// Require middleware functions
const {
  validateOrderId,
  validateUserIdForCustomer,
  validateStallIdForCustomer,
} = require("./middleware/customer/operationalValidation.js");

const {
  validateInspection,
  validateStallId,
} = require("./middleware/nea-officer/inspectionValidation");

const {
  verifyJWT
} = require("./middleware/userAccount/authorization.js");

const {
    validateStall,
    validateStallId: validateVendorStallId
} = require("./middleware/vendor/stallValidation.js");

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// ROUTES //

// Routes for customer operation
app.get("/customer/order/:order_id", validateOrderId, customerController.getOrderById);
app.get("/customer/orders/:user_id", validateUserIdForCustomer, customerController.getOrdersOfUser);
app.get("/customer/hawkerCentres/with-stalls", customerController.getHawkerCentresWithStalls);
app.get("/customer/stall/:stall_id", validateStallIdForCustomer, customerController.getMenuItemsOfStall);

// Routes for inspections
app.get("/nea/inspections/stall/:stallId", verifyJWT, validateStallId, inspectionController.getInspectionsByStall);
app.post("/nea/inspections", verifyJWT, validateInspection, inspectionController.createInspection);

// Routes for user account management
app.post("/register", userController.createUser);
app.post("/login", userController.loginUser);
app.get("/users", userController.getAllUsers);
app.get("/users/:name", userController.getUserByUsername);
app.put("/users/:id", userController.updateUser);
app.put("/users/:id/update-password", userController.updatePassword);
app.delete("/users/:id", userController.deleteUser);

//route for vendor stall management
app.get("/vendor/stalls", verifyJWT, stallController.getLoginUserStalls);
app.get("/vendor/stalls/:id", verifyJWT, validateVendorStallId, stallController.getStallById);
app.post("/vendor/stalls", verifyJWT, validateStall, stallController.createStall);
app.put("/vendor/stalls/:id", verifyJWT, validateVendorStallId, validateStall,stallController.updateStall);
app.delete("/vendor/stalls/:id", verifyJWT, validateVendorStallId, stallController.deleteStall);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
// Listen for termination signals (like Ctrl+C)
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Close any open connections
  await sql.close();
  console.log("Database connections closed");
  process.exit(0); // Exit the process
});