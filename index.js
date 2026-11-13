
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const mobileRoutes = require('./routes/mobileRoutes');
const userRoutes = require('./routes/userRoutes');

const server = express();

server.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

server.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

server.use(express.json());

server.use(cookieParser());

// API routes

server.use('/api/mobiles', mobileRoutes);
server.use('/api/auth', authRoutes);
server.use('/api/users', userRoutes);


// Home route
server.get('/', (req, res) => {
    res.send('Mobile Shop Backend is running');
});

// 404 handler - MUST be last
server.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        data: null
    });
});


connectDB();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
