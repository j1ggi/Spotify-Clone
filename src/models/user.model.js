const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
    role: {
        type: String,
        default: "user"
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    likedSongs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song"
        }
    ]
});

const user = mongoose.model("user", userschema);

module.exports = user;
