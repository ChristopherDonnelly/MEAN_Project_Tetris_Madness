const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    username: { type: String, unique: true, required: [true, "Username is required"], minlength: [6, "Username must be at least 6 characters long"] },
    wins: { type: Number, default: 0 },
    loses: { type: Number, default: 0 },
    total_games_played: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    single_clears: { type: Number, default: 0 },
    double_clears: { type: Number, default: 0 },
    triple_clears: { type: Number, default: 0 },
    tetris_clears: { type: Number, default: 0 },
    games: [
        {
            game_id: { type:String },
            opponent_id: { type:String },
            opponent_name: { type:String },
            won: { type:Boolean, default: false },
            score: { type:Number, default: 0},
            single_clear: { type: Number, default: 0 },
            double_clear: { type: Number, default: 0 },
            triple_clear: { type: Number, default: 0 },
            tetris_clear: { type: Number, default: 0 }
        }
    ]
}, {timestamps: true });