const admin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access Denied. Admin privilege required."
        });
    }

    next();
};

module.exports = admin;
