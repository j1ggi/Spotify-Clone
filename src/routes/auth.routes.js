const express = require("express");
const router = express.Router();

const authcontroller = require("../controller/auth.controller");
const auth = require("../middleware/auth");

// Public authentication routes
router.post("/register", authcontroller.register);
router.post("/login", authcontroller.login);

// Protected user routes
router.get("/me", auth, authcontroller.getMe);
router.post("/like/:songId", auth, authcontroller.likeSong);
router.delete("/unlike/:songId", auth, authcontroller.unlikeSong);
router.get("/liked", auth, authcontroller.getLikedSongs);

module.exports = router;
