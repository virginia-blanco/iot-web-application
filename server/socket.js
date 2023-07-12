const mqtt = require('./mqtt');

const sockets = {};
module.exports.init = (http) => {

    var io = require('socket.io')(http);


    io.on('connection', async (socket) => {   //gestionar el socket
        sockets[socket.id] = socket; //clave id
        console.log("User connected with socket id: " + socket.id);
        socket.emit('userConnected', socket.id);
        socket.on('disconnect', () => {
            //delete sockets[socket.id];
            console.log("User disconnected with socket id: " + socket.id);
        })
    })
    .on('disconnection', async () => {
        console.log("1");
        for (const socket of Object.values(sockets)) {
            console.log("1");
            socket.emit('serverDisconnected', "");
        }
        await mqtt.serverDisconnected();
    });

};

module.exports.deviceConnected = (id,description) => {
    console.log("Device with id: "+id + " and description: " +description + " has been connected");
    for (const socket of Object.values(sockets)) {
        socket.emit('deviceConnected', {id, description});
    }
};

module.exports.sendRelayState = (id, state) => {
    for (const socket of Object.values(sockets)) {
        socket.emit('sendRelayState', { id, state });
    }
    //io.sockets.emit('hi', 'everyone') creo que igual no hay que hacer el for o io.emit('hi', 'everyone');  emite a todo dios creo
};

module.exports.mqttDisconnected = (matter,id) => {
    console.log("MQTT is not connected properly");
    console.log("matter: "+matter+", id: "+id);
    for (const socket of Object.values(sockets)) {
        socket.emit('mqttDisconnected', {matter,id});
    }
};

module.exports.deviceDisconnected = (id,description) => {
    console.log("Device with id: "+id + " and description: " +description + " has been disconnected");
    for (const socket of Object.values(sockets)) {
        socket.emit('deviceDisconnected', {id, description});
    }
};

