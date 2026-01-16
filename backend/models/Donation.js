const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String }, 
    amount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'pending' 
    },
    transactionId: { type: String }, 
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', DonationSchema);