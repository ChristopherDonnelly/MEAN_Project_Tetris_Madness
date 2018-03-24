const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    first_name:  { type: String, required: [true, "First name is required"], minlength: [2, "First name must be at least 2 characters long"] },
    last_name:  { type: String, required: [true, "Last name is required"], minlength: [2, "Last name must be at least 2 characters long"] },
    email:  { type: String, required: [true, "Email is required"], minlength: [2, "Email must be at least 2 characters long"] },
    password:  { type: String, required: [true, "Password is required"], minlength: [2, "Password must be at least 2 characters long"] },
    password_confirm:  { type: String, required: [true, "Password confirm is required"], minlength: [2, "Password confirm must be at least 2 characters long"] }
}, {timestamps: true });