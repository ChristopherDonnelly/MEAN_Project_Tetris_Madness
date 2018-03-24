const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/tetris_madness');

var DBSchema = require('../models/db_model');

const DB_Model = mongoose.model('DB_Model', DBSchema);