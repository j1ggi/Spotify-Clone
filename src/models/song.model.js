const mongoose = require("mongoose")

const songSchema = new mongoose.Schema({
    title :{
        type : String,
        required : true
    },
    artist :{
        type : String,
        required : true
    },
    album :{
        type : String,
        required : true
    },
     duration: {
        type: String,
        required: true
    },

    image: {
        type: String
    },

    audio: {
        type: String
    }
});

const Song = mongoose.model("Song", songSchema);

module.exports = Song;