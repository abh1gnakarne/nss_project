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

app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./backend/routes/auth');
app.use('/api/auth', authRoutes);

const donationRoutes = require('./backend/routes/donation');
app.use('/api/donate', donationRoutes);

const adminRoutes = require('./backend/routes/admin');
app.use('/api/admin', adminRoutes);

// Database Connection
const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://abhignakarne4204_db_user:ZZB07dYsBPNYpLzs@cluster0.watyeu7.mongodb.net/?appName=Cluster0"; 
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_testing';

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/api/payment/hash', (req, res) => {
    const { order_id, amount, currency } = req.body;

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    const formattedAmount = parseFloat(amount).toFixed(2);
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const str = merchantId + order_id + formattedAmount + currency + hashedSecret;
    const hash = crypto.createHash('md5').update(str).digest('hex').toUpperCase();

    res.json({
        hash: hash,
        merchantId: merchantId,
        amount: formattedAmount
    });
});

app.post('/api/payment/notify', async (req, res) => {

    const { order_id, status_code, md5sig, merchant_id, payhere_amount, payhere_currency } = req.body;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const str = merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret;
    const expectedHash = crypto.createHash('md5').update(str).digest('hex').toUpperCase();

    if (expectedHash === md5sig) {
        if (status_code == 2) { 
            console.log(`Payment successful for Order: ${order_id}`);
        
        }
    }
    
    res.sendStatus(200);
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});