const express = require('express');
const app = express();
var http = require('http').createServer(app);

const mqtt = require('./mqtt');
const myRouter = require('./router');
const socket = require('./socket');
//endpoint: donde se ejecuta la funcion de la peticion

//middleware: con use
app.use(express.json());
app.use('/', express.static('web'));
app.use('/api', myRouter);

socket.init(http);
mqtt.init();

http.listen(3000, () => {
    console.log('Listening on port: 3000');
});


