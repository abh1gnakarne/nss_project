const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

// Initiate Donation (Saves as PENDING)
router.post('/initiate', async (req, res) => {
    try {
        const { userId, userName, amount } = req.body;
        const newDonation = new Donation({ userId, userName, amount, status: 'pending' });
        await newDonation.save();
        res.status(201).json(newDonation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User History
router.get('/history/:userId', async (req, res) => {
    try {
        const history = await Donation.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Simulate Payment Confirmation
router.put('/verify/:id', async (req, res) => {
    try {
        const updated = await Donation.findByIdAndUpdate(
            req.params.id, 
            { status: 'success' }, 
            { new: true }
        );
        res.json({ message: "Payment Verified", updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;