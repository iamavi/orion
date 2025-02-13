const jwt = require("jsonwebtoken");

// ✅ Middleware: Authenticate User
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Store user data in request
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

// ✅ Middleware: Authorize Roles (Admin-Only Example)
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: You do not have permission" });
        }
        next();
    };
};

module.exports = { authenticate, authorizeRoles };
