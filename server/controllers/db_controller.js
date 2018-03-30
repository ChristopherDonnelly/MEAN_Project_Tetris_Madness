const mongoose = require('mongoose');
const User = mongoose.model('DB_Model');

module.exports = {
    findAll: (req, res) => {
        User.find({}, { __v:0, createdAt:0, updatedAt:0 }, (err, users) => {
            if(err){
                res.json({message: "Error", error: err});
            }else{
                res.json({message: "Success", users: users});
            }
        });
    },
    findOne: (req, res) => {
        console.log('Get User By Id: ' + req.params.id)
        User.findById({_id: req.params.id}, (err, user) => {
            if(err){
                res.json({message: "Error", error: err});
            }else{
                res.json({message: "Success", user: user});
            }
        });
    },
    findOneGame: (req, res) => {
        console.log('Get User By Id: ' + req.params.id)
        console.log('Get Game By Id: ' + req.params.game_id)
        User.findById({ _id: req.params.id },  { games: { $elemMatch: { game_id: req.params.game_id }}}, (err, game) => {
            if(err){
                res.json({message: "Error", error: err});
            }else{
                res.json({message: "Success", game});
            }
        });
    },
    getPOD: (req, res) => {
        console.log('Find User with highest score.')
        User.findOne({}).sort('-score').exec(function (err, user) {
            if(err){
                res.json({message: "Error", error: err});
            }else{
                res.json({message: "Success", user: user});
            }
        });
    },
    update: (req, res) => {
        var query = {'_id': req.params.id};

        console.log('Attempting to update User by Id: '+req.body);

        User.findByIdAndUpdate(query, req.body, {upsert: true, new: true, runValidators: true}, function(err, user){
            if(err) {
                console.log('Something went wrong, could not update User: '+req.params.id);
                console.log("Returned error", err);
                res.json({message: "Error", error: err});
            } else {
                console.log(user)
                res.json({message: "Success", user: user});
            }
        });
    },
    create: (req, res) => {
        console.log(`Attempt Create new User: ${req.body.first_name} ${req.body.last_name}`)
        var user = new User( req.body );

        user.save((err) => {
            if(err) {
                console.log('Something went wrong while trying to create User: ' + req.body);
                console.log("Returned error", err);
                res.json({message: "Error", error: err});
            } else {
                console.log('Successfully created new User: ' + req.body);
                res.json({message: "Success", user: user});
            }
        });
    },
    login: (req, res) => {
        console.log(`Attempt Login User: ${req.body.username}`);

        User.findOne({username: req.body.username}, { __v:0, createdAt:0, updatedAt:0 }, (err, user) => {
            console.log(err)
            if(err||!user){
                var user = new User( req.body );

                user.save((err) => {
                    if(err) {
                        console.log('Something went wrong while trying to create User: ' + req.body);
                        console.log("Returned error", err);
                        res.json({message: "Error", error: err});
                    } else {
                        console.log('Successfully created new User: ' + req.body.username);
                        delete user.__v;
                        delete user.createdAt;
                        delete user.updatedAt;
                        res.json({message: "Success", user: user});
                    }
                });
            }else{
                console.log('Successfully logged in User: ' + req.body.username);
                res.json({message: "Success", user: user});
            }
        });
    },
    delete: (req, res) => {
        User.remove({ _id: req.params.id }, (err, user) => {
            if(err){
                console.log('Something went wrong, could not remove User: '+req.params.id);
                console.log("Returned error", err);
                res.json({message: "Error", error: err});
            }else{
                console.log('Successfully deleted User: '+req.params.id);
                res.json({message: "Success", user: user});
            }
        });
    }
} 