// models/UserModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address'], // Basic email validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Minimum password length
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);
