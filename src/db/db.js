require("dotenv").config();
const mongoose = require("mongoose");

async function connectdb() {
    try {
        const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/spotify";
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        throw err;
    }
}

module.exports = connectdb;
