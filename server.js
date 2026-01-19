require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const Donation = require('./backend/models/Donation');

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

        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        if (!merchantId || !merchantSecret) {
            return res.status(500).json({ message: "PayHere credentials not configured" });
        }

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
    try {
        const {
            merchant_id,
            order_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig
        } = req.body;

        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
        const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

        const localMd5Sig = crypto.createHash('md5')
            .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
            .digest('hex').toUpperCase();

        if (localMd5Sig !== md5sig) {
            console.error("❌ Invalid Signature for order:", order_id);
            return res.status(400).send("Invalid Signature");
        }

        if (status_code == "2") {
            console.log(`✅ Payment Success for Order: ${order_id}`);

            // Find donation by transactionId (which matches order_id) and update status
            const donation = await Donation.findOneAndUpdate(
                { transactionId: order_id },
                { status: 'success' },
                { new: true }
            );

            if (donation) {
                console.log(`Payment saved for user: ${donation.userName}`);
            } else {
                console.warn(`Payment received but no matching donation found for order: ${order_id}`);
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("Notify Error:", err);
        res.sendStatus(500);
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