require('dotenv').config();
const crypto = require('crypto');

const merchantId = process.env.PAYHERE_MERCHANT_ID || "1233599";
const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
const order_id = "TEST_123456";
const amount = "500.00";
const currency = "LKR";

console.log("--- Debugging Hash ---");
console.log("Merchant ID:", merchantId);
console.log("Merchant Secret (First 5):", merchantSecret ? merchantSecret.substring(0, 5) : "UNDEFINED");

if (!merchantSecret) {
    console.error("ERROR: Merchant Secret is missing from .env");
    process.exit(1);
}

const hashedSecret = crypto.createHash('md5')
    .update(merchantSecret).digest('hex').toUpperCase();

console.log("Hashed Secret:", hashedSecret);

const hashString = merchantId + order_id + amount + currency + hashedSecret;
console.log("Hash String:", hashString);

const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
console.log("Final Hash:", hash);
