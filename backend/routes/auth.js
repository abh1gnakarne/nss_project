const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Use Environment Variable or Fallback (prevents crash if env missing)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret';

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword,
            role: role || 'user'
        });
        
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (role && user.role !== role) {
            return res.status(403).json({ message: `Access denied. You are not an ${role}.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Uses the Secure Key from Vercel Variables
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
        );

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
        console.error("Login Error:", err); // This will show in Vercel Logs
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;