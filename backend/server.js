require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { initWeb3 } = require('./utils/web3');

const app = express();

// Connect to MongoDB
connectDB();

// Initialize Blockchain connection
initWeb3().then(() => {
    console.log('Blockchain connection initialized');
}).catch(err => {
    console.error('Failed to initialize blockchain:', err);
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/beneficiaries', require('./routes/beneficiaries'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});