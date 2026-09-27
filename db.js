const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        // Do not crash the application process
    }
};

module.exports = connectDB;