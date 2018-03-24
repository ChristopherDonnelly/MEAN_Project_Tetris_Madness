const mongoose = require('mongoose');
const User = mongoose.model('DB_Model');

module.exports = {
    findAll: (req, res) => {
        User.find({}, (err, users) => {
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
    update: (req, res) => {
        var query = {'_id': req.params.id};

        console.log('Attempting to update User by Id: '+req.body);

        User.findByIdAndUpdate(query, req.body, {upsert: true, new: true, runValidators: true}, function(err, player){
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