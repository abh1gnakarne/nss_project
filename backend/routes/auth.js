const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and Save User
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword,
            role: role || 'user' // Defaults to 'user' if not specified
        });
        
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// FORGOT PASSWORD ROUTE 
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: "Email not found" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();
        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN ROUTE 
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Verify Role 
        if (role && user.role !== role) {
            return res.status(403).json({ message: `Access denied. You are not an ${role}.` });
        }

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, "secretKey", { expiresIn: "1h" });

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            } 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;