require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if Authorization header is present and starts with 'Bearer '
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authorization token required. Please login."
            });
        }

        // Extract token after 'Bearer '
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Authentication token is missing."
            });
        }

        // Verify token with JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info (id, role) to the request object
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token. Please login again."
        });
    }
};

module.exports = auth;
