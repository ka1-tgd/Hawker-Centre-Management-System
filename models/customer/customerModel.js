// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get all stalls by hawker centre (for Postman testing)
async function getAllStallsByHC() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        const query = `SELECT ;`;
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