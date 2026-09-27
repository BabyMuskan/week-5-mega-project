const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

// 1. Routes Imports
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();

// Global CORS Configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database connection
connectDB().catch(err => ("DB Warning:", err.message));

// 2. Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes); 

// Base Root Health Check
app.get('/', (req, res) => {
    res.send('API is running successfully!');
});

const PORT = process.env.PORT || 5000;
app. listen(PORT, '0.0.0.0', () => {
});