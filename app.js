// Require express, mssql, dotenv and path
const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");
console.log("DB_SERVER is:", process.env.DB_SERVER);

// Load environment variables
dotenv.config();

// Require contollers
const inspectionController = require("./controllers/nea-officer/inspectionController");


// Require middleware functions
const {
  validateInspection,
  validateStallId,
} = require("./middleware/nea-officer/inspectionValidation");

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Routes for inspections
app.get("/nea/inspections/stall/:stallId", validateStallId, inspectionController.getInspectionsByStall);
app.post("/nea/inspections", validateInspection, inspectionController.createInspection);

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