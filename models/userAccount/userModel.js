// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get user by ID
async function getUserById(id) {
    let connection;
    try {
        // Connect to database
        connection = await sql.connect(dbConfig);

        // SQL Query
        const query = `SELECT user_id, name, contact_no, email, role FROM Users WHERE user_id = @id;`;
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(query);

        // Check if database returns a user
        if (result.recordset.length === 0) {
            // If user not found, return null
            return null;
        };

        // Return user
        return result.recordset[0];
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

// Get user by username
async function getUserByUsername(username) {
    let connection;
    try {
        // Connect to database
        connection = await sql.connect(dbConfig);

        // SQL Query
        const query = `SELECT user_id, name, contact_no, email, passwordHash, role FROM Users WHERE name = @name;`;
        const request = connection.request();
        request.input("name", username);
        const result = await request.query(query);

        // Check if database returns a user
        if (result.recordset.length === 0) {
            // If user not found, return null
            return null;
        };

        // Return user
        return result.recordset[0];
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

// Create user
async function createUser(userData) {
    let connection;
    try {
        // Connect to database
        connection = await sql.connect(dbConfig);

        // SQL Query
        const query = 
            `INSERT INTO Users (name, contact_no, email, passwordHash, role) 
            VALUES (@name, @contact_no, @email, @passwordHash, @role); 
            SELECT SCOPE_IDENTITY() AS user_id;`;
        const request = connection.request();
        request.input("name", userData.name);
        request.input("contact_no", userData.contact_no);
        request.input("email", userData.email);
        request.input("passwordHash", userData.password);
        request.input("role", userData.role);
        const result = await request.query(query);

        // Get new user's ID
        const newUserId = result.recordset[0].user_id;

        // Return User
        return await getUserById(newUserId);
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

// Update user
async function updateUser(id, updatedUserData) {
    let connection;
    try {
        // Connect to database
        connection = await sql.connect(dbConfig);

        // SQL Query
        const query = 
            `UPDATE Users SET name = @name, contact_no = @contact_no, email = @email WHERE user_id = @id;`;
        const request = connection.request();
        request.input("id", id);
        request.input("name", updatedUserData.name);
        request.input("contact_no", updatedUserData.contact_no);
        request.input("email", updatedUserData.email);
        request.input("role", updatedUserData.role);
        const result = await request.query(query);

        // Check if anything was updated
        if (result.rowsAffected[0] === 0) {
            // If nothing was updated, return null
            return null;
        };

        // Get updated user
        const getUpdatedUserQuery = `SELECT user_id, name, contact_no, email, role FROM Users WHERE user_id = @id;`;
        const getUpdatedUserRequest = connection.request();
        getUpdatedUserRequest.input("id", id);
        const updatedUserResult = await getUpdatedUserRequest.query(getUpdatedUserQuery);

        // Return user
        return updatedUserResult.recordset[0];
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

// Update password
async function updatePassword(id, updatedPassword) {
    let connection;
    try {
        // Connect to database
        connection = await sql.connect(dbConfig);

        // SQL Query
        const query = 
            `UPDATE Users SET passwordHash = @passwordHash WHERE user_id = @id;`;
        const request = connection.request();
        request.input("id", id);
        request.input("passwordHash", updatedPassword);
        const result = await request.query(query);

        // Check if anything was updated
        if (result.rowsAffected[0] === 0) {
            // If nothing was updated, return null
            return null;
        };

        // Get updated user
        const getUpdatedUserQuery = `SELECT user_id, name, contact_no, email, role FROM Users WHERE user_id = @id;`;
        const getUpdatedUserRequest = connection.request();
        getUpdatedUserRequest.input("id", id);
        const updatedUserResult = await getUpdatedUserRequest.query(getUpdatedUserQuery);

        // Return user
        return updatedUserResult.recordset[0];        
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

// Delete user
async function deleteUser(id) {
    let connection;
    try {
        // Connect to database
        connection = await sql.connect(dbConfig);

        // SQL Query to delete user's loyalty points
        const loyalPtsQuery = `DELETE FROM LoyaltyPoints WHERE user_id = @id`;
        const loyalPtsRequest = connection.request();
        loyalPtsRequest.input("id", id);
        const loyalPtsResult = await loyalPtsRequest.query(loyalPtsQuery);

        // SQL Query to delete user
        const userQuery = `DELETE FROM Users WHERE user_id = @id`;
        const userRequest = connection.request();
        userRequest.input("id", id);
        const userResult = await userRequest.query(userQuery);

        // Check if any was deleted
        if (userResult.rowsAffected[0] === 0) {
            // If nothing was deleted, return false
            return false;
        };

        // If user was deleted, return true
        return true;
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

// Export functions
module.exports = {
    getUserByUsername,
    createUser,
    updateUser,
    updatePassword,
    deleteUser
};