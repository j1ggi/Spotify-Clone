require("dotenv").config();
const Imagekit = require("imagekit");

const imagekit = new Imagekit({
    publicKey: (process.env.IMAGEKIT_PUBLIC_KEY || "").trim(),
    privateKey: (process.env.IMAGEKIT_PRIVATE_KEY || "").trim(),
    urlEndpoint: (process.env.IMAGEKIT_URL_ENDPOINT || "").trim()
});

const uploadFile = async (file) => {
    try {
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        const response = await imagekit.upload({
            file: file.buffer,
            fileName: `${Date.now()}_${cleanName}`
        });
        return response;
    } catch (err) {
        console.error("ImageKit upload error:", err.message);
        throw new Error("Failed to upload file to cloud storage: " + err.message);
    }
};

module.exports = uploadFile;
