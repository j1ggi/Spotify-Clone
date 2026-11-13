const mongoose = require("mongoose");
const Playlist = require("../models/playlist.model");
const Song = require("../models/song.model");

// 1. Create a new playlist
const createPlaylist = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Playlist name is required"
            });
        }

        const playlist = await Playlist.create({
            name: name.trim(),
            user: req.user.id,
            songs: []
        });

        res.status(201).json({
            message: "Playlist created successfully",
            playlist
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to create playlist: " + err.message
        });
    }
};

// 2. Fetch logged-in user's playlists
const getMyPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ user: req.user.id })
            .populate("songs")
            .populate("user", "-password")
            .sort({ _id: -1 });

        res.status(200).json({
            message: "Playlists fetched successfully",
            playlists
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch playlists: " + err.message
        });
    }
};

// 3. Get single playlist by ID
const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid playlist ID format"
            });
        }

        const playlist = await Playlist.findById(id)
            .populate("songs")
            .populate("user", "-password");

        if (!playlist) {
            return res.status(404).json({
                message: "Playlist not found"
            });
        }

        res.status(200).json({
            message: "Playlist fetched successfully",
            playlist
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching playlist: " + err.message
        });
    }
};

// 4. Add a song to playlist (with ownership verification)
const addSong = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { songId } = req.body;

        if (!songId) {
            return res.status(400).json({
                message: "Song ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({
                message: "Invalid playlist or song ID format"
            });
        }

        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({
                message: "Playlist not found"
            });
        }

        // Ownership Check: Only the playlist creator can add songs
        if (playlist.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to modify this playlist"
            });
        }

        // Check if song exists in DB
        const songExists = await Song.findById(songId);
        if (!songExists) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        // Check if song is already in the playlist
        const alreadyExists = playlist.songs.some(
            (id) => id.toString() === songId
        );

        if (alreadyExists) {
            return res.status(400).json({
                message: "Song already exists in this playlist"
            });
        }

        // Add song and save
        playlist.songs.push(songId);
        await playlist.save();

        const updatedPlaylist = await Playlist.findById(playlistId).populate("songs");

        res.status(200).json({
            message: "Song added to playlist successfully",
            playlist: updatedPlaylist
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to add song to playlist: " + err.message
        });
    }
};

// 5. Remove a song from playlist (with ownership verification)
const removeSong = async (req, res) => {
    try {
        const { playlistId, songId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({
                message: "Invalid playlist or song ID format"
            });
        }

        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({
                message: "Playlist not found"
            });
        }

        // Ownership Check
        if (playlist.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to modify this playlist"
            });
        }

        // Filter out the song
        playlist.songs = playlist.songs.filter(
            (id) => id.toString() !== songId
        );

        await playlist.save();

        const updatedPlaylist = await Playlist.findById(playlistId).populate("songs");

        res.status(200).json({
            message: "Song removed from playlist successfully",
            playlist: updatedPlaylist
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to remove song: " + err.message
        });
    }
};

// 6. Delete a playlist (with ownership verification)
const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid playlist ID format"
            });
        }

        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({
                message: "Playlist not found"
            });
        }

        // Ownership Check
        if (playlist.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to delete this playlist"
            });
        }

        await Playlist.findByIdAndDelete(id);

        res.status(200).json({
            message: "Playlist deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete playlist: " + err.message
        });
    }
};

module.exports = {
    createPlaylist,
    getMyPlaylists,
    getPlaylistById,
    addSong,
    removeSong,
    deletePlaylist
};
