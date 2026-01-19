require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const Donation = require('./backend/models/Donation');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let isConnected = false;

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

// Stripe Config Route
app.get('/api/payment/config', (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Create Payment Intent
app.post('/api/payment/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency } = req.body;

        // Amount must be in smallest currency unit (e.g. cents)
        const amountInCents = Math.round(Number(amount) * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: currency || 'lkr',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (e) {
        console.error("Stripe Error:", e);
        res.status(500).json({ error: e.message });
    }
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