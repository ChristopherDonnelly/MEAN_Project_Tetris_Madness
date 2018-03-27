const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    username: { type: String, unique: true, required: [true, "Username is required"], minlength: [6, "Username must be at least 6 characters long"] },
    wins: { type: Number },
    loses: { type: Number },
    total_games_played: { type: Number },
    score: { type: Number, default: 0 },
    max_combo: { type: Number },
    current_combo: { type: Number },
    single_clear: { type: Number },
    double_clear: { type: Number },
    triple_clear: { type: Number },
    tetris_clear: { type: Number }
}, {timestamps: true });