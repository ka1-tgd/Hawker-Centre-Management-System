function validateRentalStallId(req, res, next) {
    const stallId = parseInt(req.params.stallId);
    if (isNaN(stallId) || stallId <= 0) {
        return res.status(400).json({
            error: "Invalid stall ID."
        });
    }
    next();
}

module.exports = {
    validateRentalStallId
};