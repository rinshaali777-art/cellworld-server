
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.DBConnectingString);
        console.log('MongoDB connected');

        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PHONE || !ADMIN_PASSWORD) {
            throw new Error('Admin environment variables are missing');
        }

        if (ADMIN_PASSWORD.length < 6) {
            throw new Error('Admin password must contain at least 6 characters');
        }

        const existingAdmin = await User.findOne({
            email: ADMIN_EMAIL.toLowerCase().trim()
        });

        if (existingAdmin) {
            console.log('An account with this email already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL.toLowerCase().trim(),
            phone: ADMIN_PHONE,
            password: hashedPassword,
            role: 'admin',
            status: 'Active'
        });

        console.log('Admin account created successfully');

    } catch (error) {
        console.error('Admin creation failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();
