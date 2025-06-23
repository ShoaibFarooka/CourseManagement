const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config({ path: './configs/.env' });
const authUtils = require('../utils/authUtils');
const { startLoader, stopLoader } = require('../utils/loader');

const seedAdmin = async (userData) => {
    const DB = process.env.DB_URI;

    startLoader({ message: '🔌 Connecting to MongoDB', color: 'blue', wait: true });
    await mongoose.connect(DB);
    await stopLoader({ finalMessage: '🔗 Connected to MongoDB!', color: 'green' });

    try {
        startLoader({ message: '🗑️ Deleting existing users', color: 'yellow', wait: true });
        await User.deleteMany({});
        await stopLoader({ finalMessage: '🧹 Deleted existing users!', color: 'yellow' });

        startLoader({ message: '🌱 Seeding admin user', color: 'cyan', wait: true });
        const { name, email, password, role } = userData;
        const passwordDigest = await authUtils.hashPassword(password);
        await User.create({
            name,
            email,
            password: passwordDigest,
            role
        });
        await stopLoader({ finalMessage: '✅ Admin seeded successfully!', color: 'cyan' });

    } catch (error) {
        await stopLoader({ finalMessage: '❌ Error occurred during seeding!', color: 'red' });
        console.log(error);
    } finally {
        startLoader({ message: '🔌 Disconnecting from MongoDB', color: 'magenta', wait: true });
        await mongoose.disconnect();
        await stopLoader({ finalMessage: '🔌 Disconnected from MongoDB!', color: 'magenta' });
    }
};

const admin = {
    name: "Admin Test",
    email: "admin@gmail.com",
    password: "12345678",
    role: "admin"
};

seedAdmin(admin);
