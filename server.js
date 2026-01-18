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

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ ERROR: MONGODB_URI is not defined in Environment Variables!");
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));
}

// Import Routes
const authRoutes = require('./backend/routes/auth');
const donationRoutes = require('./backend/routes/donation');
const adminRoutes = require('./backend/routes/admin');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/donate', donationRoutes);
app.use('/api/admin', adminRoutes);

app.post('/api/payment/hash', (req, res) => {
    try {
        const { order_id, amount, currency } = req.body;
        
        const merchantId = "1233599"; 
        const merchantSecret = "MTcxMzYwODQ4MjUyNDg2Njk0MTI1MDYxNDAzOTIyMDQ5NjEzNjQ5";

        const formattedAmount = Number(amount).toFixed(2); 

        const hashedSecret = crypto.createHash('md5')
            .update(merchantSecret)
            .digest('hex')
            .toUpperCase();

        const hashString = merchantId + order_id + formattedAmount + currency + hashedSecret;
        
        // Generate Final Hash
        const hash = crypto.createHash('md5')
            .update(hashString)
            .digest('hex')
            .toUpperCase();

        res.json({ 
            merchantId: merchantId, 
            hash: hash, 
            amount: formattedAmount, 
            currency: currency 
        });
    } catch (error) {
        console.error("Hashing Error:", error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/payment/notify', async (req, res) => {
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;
  
  const merchantSecret = "MTcxMzYwODQ4MjUyNDg2Njk0MTI1MDYxNDAzOTIyMDQ5NjEzNjQ5";

  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const localHashString = merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret;
  const localHash = crypto.createHash('md5').update(localHashString).digest('hex').toUpperCase();

  if (localHash === md5sig && status_code == 2) {
    console.log(`✅ Payment SUCCESS for Order ID: ${order_id}`);

  }

  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Local Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;