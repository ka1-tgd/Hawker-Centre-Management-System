const rentalModel = require("../../models/vendor/RentalModel");

// Get all rental agreements for the logged in hawker
async function getLoginUserRentalAgreements(req, res) {
    try {
        const userId = req.user.id;
        const rentalAgreements =
            await rentalModel.getLoginUserRentalAgreements(userId);
        res.json(rentalAgreements);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error retrieving rental agreements."
        });
    }
}

// Get one rental agreement
async function getRentalAgreementByStall(req, res) {
    try {
        const userId = req.user.id;
        const stallId = parseInt(req.params.stallId);
        const rentalAgreement =
            await rentalModel.getRentalAgreementByStall(
                stallId,
                userId
            );
        if (!rentalAgreement) {
            return res.status(404).json({
                error: "Rental agreement not found."
            });
        }
        res.json(rentalAgreement);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error retrieving rental agreement."
        });
    }
}

// Pay Rental Agreement
async function payRentalAgreement(req, res) {
    try {
        const userId = req.user.id;
        const stallId = parseInt(req.params.stallId);
        const rentalAgreement =
            await rentalModel.payRentalAgreement(
                stallId,
                userId
            );
        if (!rentalAgreement) {
            return res.status(404).json({
                error: "Rental agreement not found."
            });
        }
        res.json({
            message: "Rental payment successful.",
            rentalAgreement
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error paying rental agreement."
        });
    }
}

module.exports = {
    getLoginUserRentalAgreements,
    getRentalAgreementByStall,
    payRentalAgreement
};