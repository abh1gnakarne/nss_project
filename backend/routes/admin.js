const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');

router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });

        const users = await User.find({ role: 'user' }).select('-password');

        //  Calculate total successful donations 
        const donations = await Donation.find({ status: 'success' });
        const totalFunds = donations.reduce((sum, item) => sum + item.amount, 0);

        const allDonations = await Donation.find().sort({ date: -1 });

        res.json({
            totalUsers,
            totalFunds,
            users,
            allDonations
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const successfulDonations = await Donation.find({ status: 'success' });
        const totalFunds = successfulDonations.reduce((sum, d) => sum + d.amount, 0);
        
        const allDonations = await Donation.find().sort({ date: -1 });

        res.json({ totalUsers, totalFunds, allDonations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;