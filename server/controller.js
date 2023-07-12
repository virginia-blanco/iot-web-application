const mqtt = require('./mqtt');
const store = require('./store');

module.exports.getDevices = async (req, res, next) => { //params de express
    //console.log("[CONTROLLER][getDevices]");
    res.send(await store.findDevices());
}

module.exports.updateDescription = async (req, res, next) => {
    //console.log("[CONTROLLER][updateDescription]");
    await store.updateDescription(req.params.id, req.body.description);
    res.sendStatus(204);   
}

module.exports.switchLed = async (req, res, next) => {
    //console.log("[CONTROLLER][switchLed]");
    await mqtt.switchLed(req.params.id);
    res.sendStatus(204);        //todo bien //204 porque no hay que procesar nada
}

module.exports.switchRelay = async (req, res, next) => {
    //console.log("[CONTROLLER][switchRelay]");
    await mqtt.switchRelay(req.params.id, req.body.state);
    res.sendStatus(204);
}

