const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get all menu items of a stall

async function getMenuItemsByStall(stallId, userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
        SELECT
            MenuItem.menu_item_id,
            MenuItem.item_name,
            MenuItem.description,
            MenuItem.price,
            MenuItem.category,
            MenuItem.availability
        FROM Menu
        INNER JOIN MenuItem
            ON Menu.menu_id = MenuItem.menu_id
        INNER JOIN Stall
            ON Menu.stall_id = Stall.stall_id
        WHERE
            Menu.stall_id = @stallId
            AND Stall.user_id = @userId
        ORDER BY MenuItem.menu_item_id;
        `;
        const request = connection.request();
        request.input("stallId", stallId);
        request.input("userId", userId);
        const result = await request.query(query);
        return result.recordset;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Get menu item by ID

async function getMenuItemById(stallId, menuItemId, userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        const query = `
        SELECT
            MenuItem.menu_item_id,
            MenuItem.item_name,
            MenuItem.description,
            MenuItem.price,
            MenuItem.category,
            MenuItem.availability
        FROM Menu
        INNER JOIN MenuItem
            ON Menu.menu_id = MenuItem.menu_id
        INNER JOIN Stall
            ON Menu.stall_id = Stall.stall_id
        WHERE
            Menu.stall_id = @stallId
            AND MenuItem.menu_item_id = @menuItemId
            AND Stall.user_id = @userId;
        `;
        const request = connection.request();
        request.input("stallId", stallId);
        request.input("menuItemId", menuItemId);
        request.input("userId", userId);
        const result = await request.query(query);
        return result.recordset[0];
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Create Menu Item


async function createMenuItem(stallId, userId, menuItemData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        // Find the menu that belongs to this stall
        const menuQuery = `
        SELECT Menu.menu_id
        FROM Menu
        INNER JOIN Stall
            ON Menu.stall_id = Stall.stall_id
        WHERE
            Menu.stall_id = @stallId
            AND Stall.user_id = @userId;
        `;
        const menuRequest = connection.request();
        menuRequest.input("stallId", stallId);
        menuRequest.input("userId", userId);
        const menuResult = await menuRequest.query(menuQuery);
        if (menuResult.recordset.length === 0) {

            return null;

        }
        const menuId = menuResult.recordset[0].menu_id;
        const insertQuery = `
        INSERT INTO MenuItem
        (
            menu_id,
            item_name,
            description,
            price,
            category,
            availability
        )
        VALUES
        (
            @menuId,
            @item_name,
            @description,
            @price,
            @category,
            @availability
        );

        SELECT SCOPE_IDENTITY() AS menu_item_id;
        `;
        const request = connection.request();
        request.input("menuId", menuId);
        request.input("item_name", menuItemData.item_name);
        request.input("description", menuItemData.description);
        request.input("price", menuItemData.price);
        request.input("category", menuItemData.category);
        request.input("availability", menuItemData.availability);
        const result = await request.query(insertQuery);

        return await getMenuItemById(
            stallId,
            result.recordset[0].menu_item_id,
            userId
        );
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Update Menu Item

async function updateMenuItem(stallId, menuItemId, userId, menuItemData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
        UPDATE MenuItem
        SET
            item_name = @item_name,
            description = @description,
            price = @price,
            category = @category,
            availability = @availability
        WHERE
            menu_item_id = @menuItemId
            AND menu_id IN
            (
                SELECT Menu.menu_id
                FROM Menu
                INNER JOIN Stall
                    ON Menu.stall_id = Stall.stall_id
                WHERE
                    Menu.stall_id = @stallId
                    AND Stall.user_id = @userId
            );
        `;

        const request = connection.request();
        request.input("stallId", stallId);
        request.input("menuItemId", menuItemId);
        request.input("userId", userId);
        request.input("item_name", menuItemData.item_name);
        request.input("description", menuItemData.description);
        request.input("price", menuItemData.price);
        request.input("category", menuItemData.category);
        request.input("availability", menuItemData.availability);

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return null;
        }
        return await getMenuItemById(
            stallId,
            menuItemId,
            userId
        );
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    finally {

        if (connection) {
            await connection.close();
        }
    }
}

// Delete Menu Item

async function deleteMenuItem(stallId, menuItemId, userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
        DELETE FROM MenuItem
        WHERE
            menu_item_id = @menuItemId
            AND menu_id IN
            (
                SELECT Menu.menu_id
                FROM Menu
                INNER JOIN Stall
                    ON Menu.stall_id = Stall.stall_id
                WHERE
                    Menu.stall_id = @stallId
                    AND Stall.user_id = @userId
            );
        `;
        const request = connection.request();
        request.input("stallId", stallId);
        request.input("menuItemId", menuItemId);
        request.input("userId", userId);
        const result = await request.query(query);
        return result.rowsAffected[0] > 0;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    finally {

        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    getMenuItemsByStall,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};