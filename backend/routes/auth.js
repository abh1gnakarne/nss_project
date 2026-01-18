const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // Hash password
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
        console.error("❌ Register Error:", err);
        res.status(500).json({ error: "Registration failed: " + err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log(`🔹 Login Attempt: ${email}`); // Log the attempt

        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found");
            return res.status(400).json({ message: "User not found" });
        }

        if (role && user.role !== role) {
            console.log("❌ Role mismatch");
            return res.status(403).json({ message: `Access denied. You are not an ${role}.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Invalid Password");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
        );

        console.log("✅ Login Successful");
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
        console.error("❌ Login System Error:", err);
        res.status(500).json({ error: "Login System Error: " + err.message });
    }
});

module.exports = router;