const MQTT = require("async-mqtt");

const store = require('./store');
const socket = require('./socket');

let mqtt;

module.exports.init = () => {
    mqtt = MQTT.connect("tcp://localhost:1883",{
        will: {
          topic: "lwtTopic",
          payload: "Server has been disconnected",
          qos: 0,
          retain: false
        }
      });//puerto 1883 donde esta el servidor de mosquitto
    mqtt.on("connect", async () => {
        try {
            console.log("Connected to MQTT");
            await mqtt.subscribe('connect');
            console.log("Subscribed to topic connect");
            await mqtt.subscribe('lwtTopic');
            console.log("Subscribed to topic lwtTopic");
            await store.init();
        } catch (e) {
            console.log(e.stack);
            process.exit();
        }
    });

    mqtt.on('message', async (topic, payload, packet) => {
        console.log("Recevied package of topic " + topic + " with content:");
        console.log(packet);
        const message = payload.toString();

        if (topic === 'connect') {
            const id = message;
            if (!await store.findDeviceById(id)) {
                await store.addDevice(id);

            }
            const device= await store.findDeviceById(id);

            await mqtt.subscribe("state_" + id);
            console.log("Subscribed to the topic state_" + id);
            await mqtt.publish("connect_" + id, "");
            console.log("Publishes topic connect_" + id + " with no payload");
            const description = device.description
            socket.deviceConnected(id,description);
            return;
        }
        if (topic === 'lwtTopic') {
            const id = message;
            const device= await store.findDeviceById(id);
            const description = device.description;
            console.log("Device with id: "+id+ " has been disconnected");
            socket.deviceDisconnected(id,description);
        }
        const [command, id] = topic.split('_');
        if (command === 'state') {
            const state = String.fromCharCode(payload.readInt8(0));
            await store.updateState(id, state);
            socket.sendRelayState(id, state);
        }

    });
};

function isMqttConnected(){
    
    return mqtt && mqtt.connected;
}

module.exports.switchRelay = async (id, state) => {
    //console.log("[MQTT][switchRelay]");
    if (!isMqttConnected()) {//si no esta bine inicializado
        console.log("MQTT is not connected");
        console.log("Cannot switch the relay state of device " +id);
        socket.mqttDisconnected(0,id);
        return;
    }
    console.log("traza   "+mqtt.connected)
    console.log("state: " + state);
    stateInt = parseInt(state);
    await mqtt.publish("switch_" + id, state);
    console.log("Publishes in topic switch_" + id + " with payload: " + state);
};

module.exports.switchLed = async (id) => {
    if (!isMqttConnected()) {
        console.log("MQTT is not connected");
        console.log("Cannot switch the led state of device " +id);
        socket.mqttDisconnected(1,id);
        return;
    }
    await mqtt.publish("led_" + id, "");
    console.log("Publishes in topic led_" + id + " with no payload");
};


