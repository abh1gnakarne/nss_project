require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

/* -------------------- ROUTES -------------------- */
const authRoutes = require('./backend/routes/auth');
app.use('/api/auth', authRoutes);

const donationRoutes = require('./backend/routes/donation');
app.use('/api/donate', donationRoutes);

const adminRoutes = require('./backend/routes/admin');
app.use('/api/admin', adminRoutes);

/* -------------------- DATABASE -------------------- */
const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://abhignakarne4204_db_user:ZZB07dYsBPNYpLzs@cluster0.watyeu7.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

/* ======================================================
   PAYHERE – HASH GENERATION
   ====================================================== */
app.post('/api/payment/hash', (req, res) => {
  const { order_id, amount, currency } = req.body;

  if (!order_id || !amount || !currency) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  if (!merchantId || !merchantSecret) {
    return res.status(500).json({ error: "Merchant configuration missing" });
  }

  const formattedAmount = Number(amount).toFixed(2);

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex');

  const hashString =
    merchantId +
    order_id +
    formattedAmount +
    currency +
    hashedSecret;

  const hash = crypto
    .createHash('md5')
    .update(hashString)
    .digest('hex')
    .toUpperCase();

  res.json({
    merchantId,
    orderId: order_id,
    amount: formattedAmount,
    currency,
    hash
  });
});

/* ======================================================
   PAYHERE – NOTIFY URL (PAYMENT VERIFICATION)
   ====================================================== */
app.post('/api/payment/notify', async (req, res) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig
  } = req.body;

  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  if (!merchantSecret) {
    return res.sendStatus(400);
  }

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex');

  const localHashString =
    merchant_id +
    order_id +
    payhere_amount +
    payhere_currency +
    status_code +
    hashedSecret;

  const localHash = crypto
    .createHash('md5')
    .update(localHashString)
    .digest('hex')
    .toUpperCase();

  if (localHash === md5sig && status_code == 2) {
    console.log(`✅ Payment SUCCESS for Order ID: ${order_id}`);
  } else {
    console.log(`❌ Payment verification failed for Order ID: ${order_id}`);
  }

  res.sendStatus(200);
});

/* -------------------- SERVER START -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
