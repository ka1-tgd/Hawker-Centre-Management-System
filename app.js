// Require express, mssql, dotenv and path
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Require contollers
const customerController = require("./controllers/customer/customerController.js");
const inspectionController = require("./controllers/nea-officer/inspectionController");
const userController = require("./controllers/userAccount/userController.js");
const stallController = require("./controllers/vendor/StallController.js");
const menuItemLikeController = require("./controllers/customerEngagement/menuItemLikeController");
const loyaltyController = require("./controllers/customerEngagement/loyaltyController");
const feedbackController = require("./controllers/customerEngagement/feedbackController");
const vendorDashboardController = require("./controllers/customerEngagement/vendorDashboardController");
const salesController = require("./controllers/vendor/salesController");

// Require middleware functions
const {
  validateOrderId,
  validateUserIdForCustomer,
  validateStallIdForCustomer,
  validateOrder,
  validateOrderItemNo,
  validateCreateOrderItem,
  validateOrderItemQuantity,
} = require("./middleware/customer/orderingValidation.js");

const {
  validateInspection,
  validateInspectionUpdate,
  validateStallId,
  validateInspectionId,
} = require("./middleware/nea-officer/inspectionValidation");

const {
  verifyJWT
} = require("./middleware/userAccount/authorization.js");

const {
    validateStall,
    validateStallId: validateVendorStallId
} = require("./middleware/vendor/stallValidation.js");

const {
  validateStallId: validateSalesStallId,
} = require("./middleware/vendor/salesValidation.js");


const menuItemLikeValidation = require("./middleware/customerEngagement/menuItemLikeValidation");
const loyaltyValidation = require("./middleware/customerEngagement/loyaltyValidation");
const feedbackValidation = require("./middleware/customerEngagement/feedbackValidation");
const vendorDashboardValidation = require("./middleware/customerEngagement/vendorDashboardValidation");

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// ROUTES //

// Routes for customer ordering and checkouts - customer order
app.get("/customer/order/:order_id", verifyJWT, validateOrderId, customerController.getOrderById);
app.get("/customer/orders/:user_id", verifyJWT, validateUserIdForCustomer, customerController.getOrdersOfUser);
app.get("/customer/hawkerCentres/with-stalls", verifyJWT, customerController.getHawkerCentresWithStalls);
app.get("/customer/stall/:stall_id", verifyJWT, validateStallIdForCustomer, customerController.getMenuItemsOfStall);
app.post("/customer/orders", verifyJWT, validateOrder, customerController.createOrder);
// Routes for customer ordering and checkouts - order item
app.get("/customer/orders/orderItem/:order_item_no", verifyJWT, validateOrderItemNo, customerController.getOrderItemByNo);
app.post("/customer/orders/items", verifyJWT, validateCreateOrderItem, customerController.createOrderItem);
app.delete("/customer/orders/:order_id/items/:order_item_no", verifyJWT, validateOrderId, validateOrderItemNo, customerController.deleteOrderItem);
app.put("/customer/orders/:order_id/items/:order_item_no", verifyJWT, validateOrderItemQuantity, customerController.updateOrderItemQuantity);

// Routes for inspections
app.get("/nea/inspections/stall/:stallId", verifyJWT, validateStallId, inspectionController.getInspectionsByStall);
app.post("/nea/inspections", verifyJWT, validateInspection, inspectionController.createInspection);
app.put("/nea/inspections/:id", verifyJWT, validateInspectionId, validateInspectionUpdate, inspectionController.updateInspection);
app.delete("/nea/inspections/:id", verifyJWT, validateInspectionId, inspectionController.deleteInspection);
app.get("/nea/inspections/summary/grades", verifyJWT, inspectionController.getGradeDistribution);
app.get("/nea/inspections/summary/expiring", verifyJWT, inspectionController.getExpiringSoon);
app.get("/nea/inspections/summary/recent", verifyJWT, inspectionController.getRecentInspections);

// Routes for user account management
app.post("/register", userController.createUser);
app.post("/login", userController.loginUser);
app.get("/users/:name", userController.getUserByUsername);
app.put("/users/:id", userController.updateUser);
app.put("/users/:id/update-password", userController.updatePassword);
app.delete("/users/:id", userController.deleteUser);

// Routes for vendor stall management
app.get("/vendor/stalls", verifyJWT, stallController.getLoginUserStalls);
app.get("/vendor/stalls/:id", verifyJWT, validateVendorStallId, stallController.getStallById);
app.post("/vendor/stalls", verifyJWT, validateStall, stallController.createStall);
app.put("/vendor/stalls/:id", verifyJWT, validateVendorStallId, validateStall, stallController.updateStall);
app.delete("/vendor/stalls/:id", verifyJWT, validateVendorStallId, stallController.deleteStall);

// Routes - Sales Analytics Dashboard
app.get("/vendor/sales/:stallId/popular-items", verifyJWT, validateSalesStallId, salesController.getPopularItems);
app.get("/vendor/sales/:stallId/peak-hours", verifyJWT, validateSalesStallId, salesController.getPeakHours);
app.get("/vendor/sales/:stallId/revenue", verifyJWT, validateSalesStallId, salesController.getRevenueSummary);
app.get("/vendor/sales/:stallId/chart", verifyJWT, validateSalesStallId, salesController.getPopularItemsChart);

// Routes - Menu Item Likes
app.post("/likes", verifyJWT, menuItemLikeValidation.validateCreateLike, menuItemLikeController.createLike);
app.get("/likes/item/:menuItemId", verifyJWT, menuItemLikeController.getLikesByMenuItem);
app.get("/likes/customer/:userId", verifyJWT, menuItemLikeController.getLikesByUser);
app.delete("/likes/:id", verifyJWT, menuItemLikeValidation.validateLikeId, menuItemLikeController.deleteLike);

// Routes - Loyalty Program 
app.get("/loyalty/:userId", verifyJWT, loyaltyController.getLoyaltyPoints);
app.get("/rewards", verifyJWT, loyaltyController.getRewards);
app.post("/redeem", verifyJWT, loyaltyValidation.validateRedeem, loyaltyController.redeemReward);
 
// Route for basic profile display on the account page 
app.get("/profile/:userId", verifyJWT, loyaltyController.getUserProfile);
 
// Routes - Feedback 
app.get("/feedback/orders/:userId", verifyJWT, feedbackController.getEligibleOrders);
app.post("/feedback", verifyJWT, feedbackValidation.validateCreateFeedback, feedbackController.createFeedback);
app.get("/feedback/customer/:userId", verifyJWT, feedbackController.getFeedbackByUser);
app.put("/feedback/:id", verifyJWT, feedbackValidation.validateFeedbackId, feedbackValidation.validateUpdateFeedback, feedbackController.updateFeedback);
app.delete("/feedback/:id", verifyJWT, feedbackValidation.validateFeedbackId, feedbackController.deleteFeedback);

// Routes - Vendor Satisfaction Dashboard (per-stall ratings + complaints, SCRUM-72)
app.get("/vendor/satisfaction", vendorDashboardValidation.validateStallId, vendorDashboardController.getSatisfaction);
app.get("/vendor/complaints", vendorDashboardValidation.validateStallId, vendorDashboardController.getComplaints);
app.put("/vendor/complaints/:id/resolve", vendorDashboardValidation.validateComplaintId, vendorDashboardController.resolveComplaint);

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
