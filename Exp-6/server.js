// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path'); // Import the path module
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;
// MONGO_URI should ideally come ONLY from process.env.MONGO_URI in production
// For debugging, it's temporarily hardcoded here based on your input, but best practice is to use .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://selvaj192003:9342831123@cluster0.yfhivzl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Use a strong, random key in production

// Import User model
// Ensure the casing here matches your actual file name (e.g., UserModel.js)
const User = require('./models/UserModel');

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cookieParser()); // For parsing cookies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token; // Get token from cookie

    if (!token) {
        // If no token, redirect to login page for frontend
        return res.redirect('/?message=Please log in to access this page.');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Clear expired/invalid token and redirect to login
            res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
            return res.redirect('/?message=Session expired or invalid. Please log in again.');
        }
        req.user = user; // Attach user payload to request
        next();
    });
};

// Routes

// Home route (public) - now serves index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sign-up (Register) Route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'User with that username or email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        console.error('Sign-up error:', error);
        res.status(500).json({ message: 'Server error during sign-up.' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password.' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Set JWT as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript
            secure: process.env.NODE_ENV === 'production', // Send cookie only over HTTPS in production
            maxAge: 3600000, // 1 hour in milliseconds
            sameSite: 'Lax', // Protects against CSRF attacks
        });

        res.status(200).json({ message: 'Logged in successfully!', username: user.username });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Protected Route for fetching user info (used by frontend)
app.get('/api/user-info', authenticateToken, (req, res) => {
    // Only send necessary user info, not the password hash
    res.status(200).json({
        username: req.user.username,
        email: req.user.email,
        message: `Welcome to your private dashboard, ${req.user.username}!`
    });
});

// Logout Route
app.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    });
    res.status(200).json({ message: 'Logged out successfully.' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
