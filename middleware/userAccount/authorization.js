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
            "GET /nea/inspections/stall/[0-9]+": ["officer"],

            // Hawker exclusive
            "POST /vendor/stalls": ["hawker"],
            "GET /vendor/stalls": ["hawker"],
            "GET /vendor/stalls/[0-9]+": ["hawker"],
            "PUT /vendor/stalls/[0-9]+": ["hawker"],
            "DELETE /vendor/stalls/[0-9]+": ["hawker"],

            // Customer exclusive
            "GET /customer/order/[0-9]+": ["customer"],
            "GET /customer/orders/[0-9]+": ["customer"],
            "GET /customer/hawkerCentres/with-stalls": ["customer"],
            "GET /customer/stall/[0-9]+": ["customer"],
            "POST /customer/orders": ["customer"],

            // Customer engagement exclusive 
            "POST /likes": ["customer"],
            "GET /likes/item/[0-9]+": ["customer"],
            "GET /likes/customer/[0-9]+": ["customer"],
            "DELETE /likes/[0-9]+": ["customer"],

            "GET /loyalty/[0-9]+": ["customer"],
            "GET /rewards": ["customer"],
            "POST /redeem": ["customer"],

            "GET /profile/[0-9]+": ["customer"],

            "GET /feedback/orders/[0-9]+": ["customer"],
            "POST /feedback": ["customer"],
            "GET /feedback/customer/[0-9]+": ["customer"],
            "PUT /feedback/[0-9]+": ["customer"],
            "DELETE /feedback/[0-9]+": ["customer"],
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