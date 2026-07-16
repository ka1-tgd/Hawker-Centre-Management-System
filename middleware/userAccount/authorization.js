const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    };

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden" });
        };

        // Set authorized roles and paths
        const authorizedRoles = {
            // Officer exclusive
            "POST /nea/inspections": ["officer"],
            "GET /nea/inspections/stall/:stallId": ["officer"],

            // Hawker exclusive
            "POST /vendor/stalls": ["hawker"],
            "GET /vendor/stalls": ["hawker"],
            "GET /vendor/stalls/:id": ["hawker"],
            "PUT /vendor/stalls/:id": ["hawker"],
            "DELETE /vendor/stalls/:id": ["hawker"],

            // Customer exclusive
            "GET /customer/order/:order_id": ["customer"],
            "GET /customer/orders/:user_id": ["customer"],
            "GET /customer/hawkerCentres/with-stalls": ["customer"],
            "GET /customer/stall/:stall_id": ["customer"],
            "POST /customer/orders": ["customer"],
        };

        const requestedEndpoint = `${req.method} ${req.url}`; // Include method in endpointl;
        const userRole = decoded.role;

        const authorizedRole = Object.entries(authorizedRoles).find(
            ([endpoint, roles]) => {
                const regex = new RegExp(`^${endpoint}$`); // Create RegExp from endpoint
                return regex.test(requestedEndpoint) && roles.includes(userRole);
            }
        );

        if (!authorizedRole) {
            return res.status(403).json({ message: "Forbidden" });
        };

        req.user = decoded; // Attach decoded user information to the request object
        next();
    });
};

module.exports = {
    verifyJWT
};