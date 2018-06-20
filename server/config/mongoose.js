const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/tetris_madness');
mongoose.connect('mongodb://heroku_h2hpx97z:fpgjo2hdacbf0nvisv800q58en@ds163410.mlab.com:63410/heroku_h2hpx97z');

var DBSchema = require('../models/db_model');

const DB_Model = mongoose.model('DB_Model', DBSchema);