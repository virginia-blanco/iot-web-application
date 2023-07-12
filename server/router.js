const express = require('express');
const controller = require('./controller');

const myRouter = express.Router();

myRouter.get('/devices', controller.getDevices);//http get
myRouter.patch('/updateDescription/:id', controller.updateDescription); //actualizar
myRouter.post('/switchLed/:id', controller.switchLed);//ejecutar algo
myRouter.post('/switchRelay/:id', controller.switchRelay);


module.exports = myRouter;
