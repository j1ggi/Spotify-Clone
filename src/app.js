require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route imports
const songroutes = require("./routes/song.routes");
const authroutes = require("./routes/auth.routes");
const playlistRoutes = require("./routes/playlist.routes");

// API mount points
app.use("/auth", authroutes);
app.use("/song", songroutes);
app.use("/playlist", playlistRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Musicify API is running" });
});

module.exports = app;
