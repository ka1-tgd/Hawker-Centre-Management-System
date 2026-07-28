const menuModel = require("../../models/vendor/MenuModel");

// Get all menu items of one stall
async function getMenuItemsByStall(req, res) {

    try {
        const userId = req.user.id;
        const stallId = parseInt(req.params.stallId);
        const menuItems = await menuModel.getMenuItemsByStall(
            stallId,
            userId
        );
        res.json(menuItems);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error retrieving menu items."
        });

    }

}

// Get one menu item
async function getMenuItemById(req, res) {
    try {
        const userId = req.user.id;
        const stallId = parseInt(req.params.stallId);
        const menuItemId = parseInt(req.params.id);
        const menuItem = await menuModel.getMenuItemById(
            stallId,
            menuItemId,
            userId
        );
        if (!menuItem) {

            return res.status(404).json({
                error: "Menu item not found."
            });
        }
        res.json(menuItem);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error retrieving menu item."
        });
    }
}

// Create
async function createMenuItem(req, res) {
    try {

        const userId = req.user.id;
        const stallId = parseInt(req.params.stallId);

        console.log("STALL ID:", stallId);
        console.log("USER ID:", userId);

        const menuItem = await menuModel.createMenuItem(
            stallId,
            userId,
            req.body
        );

        res.status(201).json(menuItem);

    }
    catch(error){
        console.error(error);
        res.status(500).json({
            error:"Error creating menu item."
        });
    }
}

// Update
async function updateMenuItem(req, res) {
    try {
        const userId = req.user.id;
        const stallId = parseInt(req.params.stallId);
        const menuItemId = parseInt(req.params.id);
        const menuItem = await menuModel.updateMenuItem(
            stallId,
            menuItemId,
            userId,
            req.body
        );
        if (!menuItem) {

            return res.status(404).json({
                error: "Menu item not found."
            });
        }
        res.json(menuItem);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error updating menu item."
        });
    }
}

// Delete
async function deleteMenuItem(req, res) {
    try {
        const userId = req.user.id;
        const stallId = parseInt(req.params.stallId);
        const menuItemId = parseInt(req.params.id);
        const deleted = await menuModel.deleteMenuItem(
            stallId,
            menuItemId,
            userId
        );
        if (!deleted) {
            return res.status(404).json({
                error: "Menu item not found."
            });
        }
        res.json({
            message: "Menu item deleted successfully."
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error deleting menu item."
        });
    }
}

module.exports = {
    getMenuItemsByStall,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};