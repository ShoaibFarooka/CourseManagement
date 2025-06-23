const mongoose = require('mongoose');
const { startLoader, stopLoader } = require('../utils/loader');

const connectDB = async (DB) => {
    try {
        startLoader({ message: '🔌 Connecting to MongoDB', color: 'blue' });
        const conn = await mongoose.connect(DB);
        await stopLoader({ finalMessage: '✅ Connected to MongoDB!', color: 'green' });
    } catch (error) {
        await stopLoader({ finalMessage: '❌ Error connecting to MongoDB:', color: 'red' });
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
