const db_ctrl = require('../controllers/db_controller');

const path = require('path');

module.exports = (app) => {

    app.get('/users/:id', (req, res) => {
        db_ctrl.findOne(req, res);
    });

    app.get('/users', (req, res) => {
        db_ctrl.findAll(req, res);
    });

    app.put('/users/:id', (req, res) => {
        db_ctrl.update(req, res);
    });

    app.post('/users', (req, res) => {
        db_ctrl.create(req, res);
    });

    app.delete('/users/:id', (req, res) => {
        db_ctrl.delete(req, res);
    });

    app.post('/login', (req, res) => {
        db_ctrl.login(req, res);
    });
    
    app.get('/pod', (req, res) => {
        db_ctrl.getPOD(req, res);
    });
    
    app.all("*", (req,res,next) => {
    	res.sendFile(path.resolve("./client/dist/index.html"))
	});

}        