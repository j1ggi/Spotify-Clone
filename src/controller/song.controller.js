const mongoose = require("mongoose");
const Song = require("../models/song.model");
const uploadFile = require("../services/storage.services");

// 1. Add / Upload a new song (Admin only)
const addsong = async (req, res) => {
    try {
        const { title, artist, album, duration } = req.body;

        const imageFile = req.files?.image?.[0];
        const audioFile = req.files?.audio?.[0];

        // Validation: Required textual fields
        if (!title || !artist || !album || !duration) {
            return res.status(400).json({
                message: "Title, artist, album, and duration are required"
            });
        }

        // Validation: Required file uploads
        if (!imageFile || !audioFile) {
            return res.status(400).json({
                message: "Both cover image and audio file are required"
            });
        }

        // Upload files to ImageKit CDN
        const imageUpload = await uploadFile(imageFile);
        const audioUpload = await uploadFile(audioFile);

        // Save song metadata and CDN URLs in MongoDB
        const song = await Song.create({
            title: title.trim(),
            artist: artist.trim(),
            album: album.trim(),
            duration: duration.trim(),
            image: imageUpload.url,
            audio: audioUpload.url
        });

        res.status(201).json({
            message: "Song added successfully",
            song
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to add song: " + err.message
        });
    }
};

// 2. Get all songs
const getallsong = async (req, res) => {
    try {
        const songs = await Song.find().sort({ _id: -1 });

        res.status(200).json({
            message: "All songs fetched successfully",
            songs
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch songs: " + err.message
        });
    }
};

// 3. Get song details by ID
const songbyid = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid song ID format"
            });
        }

        const song = await Song.findById(id);

        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        res.status(200).json({
            message: "Song found",
            song
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching song: " + err.message
        });
    }
};

// 4. Delete a song (Admin only)
const deleted = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid song ID format"
            });
        }

        const song = await Song.findByIdAndDelete(id);

        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        res.status(200).json({
            message: "Song deleted successfully",
            song
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete song: " + err.message
        });
    }
};

// 5. Update a song (Admin only)
const updatesong = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid song ID format"
            });
        }

        const { title, artist, album, duration, image, audio } = req.body;

        const updatedSong = await Song.findByIdAndUpdate(
            id,
            { title, artist, album, duration, image, audio },
            { new: true, runValidators: true }
        );

        if (!updatedSong) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        res.status(200).json({
            message: "Song updated successfully",
            song: updatedSong
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to update song: " + err.message
        });
    }
};

module.exports = {
    addsong,
    getallsong,
    songbyid,
    deleted,
    updatesong
};
