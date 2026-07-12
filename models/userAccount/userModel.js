// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get all users (for Postman testing)
async function getAllUsers() {
    let connection;
    try {
        // Connect to database
        connection = await sql.connect(dbConfig);

        // SQL Query
        const query = "SELECT user_id, username, role FROM Users";
        const result = await connection.request().query(query);

        // Return users
        return result.recordset;
  } catch (error) {
        // If error, throw error
        console.error("Database error:", error);
        throw error;
  } finally {
        if (connection) {
            try {
                // Attempt to close database connection
                await connection.close();
            } catch (err) {
                // If fail to close connection, display error in console
                console.error("Error closing connection:", err);
            };
        };
    };
};

// Get user by ID
async function getUserByUsername(username) {
    
};

// Create user
async function createUser() {

};

// Update user
async function updateUser() {
    // name, password, contactNo
};

// Delete user
async function deleteUser() {

};

// Export functions
module.exports = {
    getAllUsers,
    getUserByUsername,
    createUser,
    updateUser,
    deleteUser
};