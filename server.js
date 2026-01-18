require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let isConnected = false; // Track connection status

const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 
        });
        isConnected = db.connections[0].readyState;
        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
};

app.use(async (req, res, next) => {
    await connectDB();
    next();
});

const authRoutes = require('./backend/routes/auth');
const donationRoutes = require('./backend/routes/donation');
const adminRoutes = require('./backend/routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/donate', donationRoutes);
app.use('/api/admin', adminRoutes);

// Payment Hash Route
app.post('/api/payment/hash', (req, res) => {
    try {
        const { order_id, amount, currency } = req.body;
        
        const merchantId = "1233599"; 
        const merchantSecret = "MTcxMzYwODQ4MjUyNDg2Njk0MTI1MDYxNDAzOTIyMDQ5NjEzNjQ5";
        const formattedAmount = Number(amount).toFixed(2); 

        const hashedSecret = crypto.createHash('md5')
            .update(merchantSecret).digest('hex').toUpperCase();

        const hashString = merchantId + order_id + formattedAmount + currency + hashedSecret;
        const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

        res.json({ merchantId, hash, amount: formattedAmount, currency });
    } catch (error) {
        console.error("Hashing Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Payment Notify Route
app.post('/api/payment/notify', async (req, res) => {
    console.log("Payment Notification Received:", req.body);
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, async () => {
        await connectDB();
        console.log(`🚀 Local Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;