const express = require("express");
const router = express.Router();

const playlistController = require("../controller/playlist.controller");
const auth = require("../middleware/auth");

// All playlist routes require JWT authentication
router.post("/create", auth, playlistController.createPlaylist);
router.get("/myplaylist", auth, playlistController.getMyPlaylists);
router.get("/:id", auth, playlistController.getPlaylistById);
router.put("/addsong/:playlistId", auth, playlistController.addSong);
router.put("/removesong/:playlistId/:songId", auth, playlistController.removeSong);
router.delete("/:id", auth, playlistController.deletePlaylist);

module.exports = router;
