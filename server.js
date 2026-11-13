require("dotenv").config();
const app = require("./src/app");
const connectdb = require("./src/db/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectdb();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server due to database connection error:", err.message);
        process.exit(1);
    }
}

startServer();
