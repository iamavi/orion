const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

const authenticate = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, jwtSecret);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
};

module.exports = authenticate;
