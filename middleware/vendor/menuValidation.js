function validateMenuItem(req, res, next) {
    const {
        item_name,
        description,
        price,
        category,
        availability
    } = req.body;

    // Item Name
    if (
        !item_name ||
        typeof item_name !== "string" ||
        item_name.trim() === ""
    ) {
        return res.status(400).json({
            error: "Item name is required."
        });
    }

    // Description
    if (
        description &&
        typeof description !== "string"
    ) {
        return res.status(400).json({
            error: "Description must be text."
        });
    }

    // Price
    if (
        price === undefined ||
        isNaN(price) ||
        Number(price) <= 0
    ) {
        return res.status(400).json({
            error: "Price must be greater than 0."
        });

    }

    // Category
    if (
        !category ||
        typeof category !== "string" ||
        category.trim() === ""
    ) {
        return res.status(400).json({
            error: "Category is required."
        });
    }

    // Availability
    if (
        availability !== "Y" &&
        availability !== "N"
    ) {
        return res.status(400).json({
            error: "Availability must be Y or N."
        });
    }
    next();
}

function validateMenuItemId(req, res, next) {
    const menuItemId = parseInt(req.params.id);
    if (isNaN(menuItemId)) {
        return res.status(400).json({
            error: "Invalid menu item ID."
        });
    }
    next();
}

module.exports = {
    validateMenuItem,
    validateMenuItemId
};