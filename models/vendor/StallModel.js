// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get all the stalls that is user can access
async function getLoginUserStalls(userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "SELECT * FROM Stall WHERE user_id = @user_id";

        const request = connection.request();
        request.input("user_id", userId);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection) await connection.close();
    }
}

// Get one stall
async function getStallById(stallId, userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "SELECT * FROM Stall WHERE stall_id = @stall_id AND user_id = @user_id";

        const request = connection.request();
        request.input("stall_id", stallId);
        request.input("user_id", userId);
        const result = await request.query(query);
        if (result.recordset.length === 0)
            return null;
        return result.recordset[0];
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection) await connection.close();
    }
}

// Create Stall
async function createStall(userId, stallData) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        // Generate the next stall_id
        const idResult = await connection.request().query("SELECT ISNULL(MAX(stall_id), 0) + 1 AS stall_id FROM Stall");

        const newStallId = idResult.recordset[0].stall_id;

        // SQL Query
        const query = "INSERT INTO Stall(stall_id, user_id, hawker_centre_id, stall_name, description, operating_hours, contact_number, status) VALUES (@stall_id, @user_id, @hawker_centre_id, @stall_name,@description, @operating_hours, @contact_number, @status);";

        const request = connection.request();

        request.input("stall_id", newStallId);
        request.input("user_id", userId);
        request.input("hawker_centre_id", stallData.hawker_centre_id);
        request.input("stall_name", stallData.stall_name);
        request.input("description", stallData.description);
        request.input("operating_hours", stallData.operating_hours);
        request.input("contact_number", stallData.contact_number);
        request.input("status", stallData.status);

        await request.query(query);

        // Return the newly created stall
        return await getStallById(newStallId, userId);

    } catch (error) {
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}
// Update Stall
async function updateStall(stallId, userId, stallData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `UPDATE Stall SET 
        stall_name = @stall_name, 
        description = @description, 
        operating_hours = @operating_hours, 
        contact_number = @contact_number, 
        status = @status 
        WHERE stall_id = @stall_id AND user_id = @user_id`;

        const request = connection.request();
        request.input("stall_id", stallId);
        request.input("user_id", userId);
        request.input("stall_name", stallData.stall_name);
        request.input("description", stallData.description);
        request.input("operating_hours", stallData.operating_hours);
        request.input("contact_number", stallData.contact_number);
        request.input("status", stallData.status);
        const result = await request.query(query);
        if (result.rowsAffected[0] === 0)
            return null;
        return await getStallById(stallId, userId);
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection) await connection.close();
    }
}

// Delete Stall
async function deleteStall(stallId, userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "DELETE FROM Stall WHERE stall_id = @stall_id AND user_id = @user_id";

        const request = connection.request();
        request.input("stall_id", stallId);
        request.input("user_id", userId);
        const result = await request.query(query);
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    } finally {
        if (connection) await connection.close();
    }
}

module.exports = {
    getLoginUserStalls,
    getStallById,
    createStall,
    updateStall,
    deleteStall
};