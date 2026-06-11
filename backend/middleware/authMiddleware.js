const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    try {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password");

            next();
        } else {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token",
            });
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token failed",
        });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Admin access only",
        });
    }
};

module.exports = {
    protect,
    adminOnly,
};