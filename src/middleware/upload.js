const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.fieldname === "image") {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed for cover image"), false);
        }
    } else if (file.fieldname === "audio") {
        if (
            file.mimetype.startsWith("audio/") ||
            file.originalname.match(/\.(mp3|wav|ogg|m4a|aac)$/i)
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only audio files (mp3, wav, ogg) are allowed for song audio"), false);
        }
    } else {
        cb(new Error("Unexpected upload field"), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 30 * 1024 * 1024 // 30 MB max
    },
    fileFilter
});

module.exports = upload;
