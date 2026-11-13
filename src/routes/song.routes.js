const express = require("express");
const router = express.Router();

const songcontroller = require("../controller/song.controller");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/upload");

// Public song routes
router.get("/allsongs", songcontroller.getallsong);
router.get("/:id", songcontroller.songbyid);

// Admin-only song routes
router.post(
    "/add",
    auth,
    admin,
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "audio", maxCount: 1 }
    ]),
    songcontroller.addsong
);

router.put("/:id", auth, admin, songcontroller.updatesong);
router.delete("/:id", auth, admin, songcontroller.deleted);

module.exports = router;
