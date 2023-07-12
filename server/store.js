const Sequelize = require('sequelize');
const sequelize = new Sequelize("sqlite:devices.sqlite", { logging: false });



const Device = sequelize.define('device', {
    id: {
        type: Sequelize.STRING,//!!!!!!!
        primaryKey: true,
        unique: { msg: "The identification number is already registered" },
        validate: { notEmpty: { msg: "Id must not be empty" } }
    },
    description: {
        type: Sequelize.STRING,
        validate: { notEmpty: { msg: "Description must not be empty" } }
    },
    state: {
        type: Sequelize.STRING,
        validate: { notEmpty: { msg: "The relay state must not be empty" } }
    }
});

module.exports.init = async () => {
    await sequelize.sync();
};

module.exports.findDeviceById = async id => {
    return await Device.findByPk(id);
};

module.exports.updateState = async (id, state) => {
    //console.log("[STORE][updateState]");
    await Device.update({ state: state }, {
        where: {
            id: id
        }
    });
    console.log("Relay state updated to: " +state + " for device: "+ id);

};

module.exports.updateDescription = async (id, description) => {
    //console.log("[STORE][updateDescription]");
    await Device.update({ description: description }, {
        where: {
            id: id
        }
    });
    console.log("Description updated to: " +description+" for device: "+ id);

};

module.exports.addDevice = async id => {
    //console.log("[STORE][addDevice]");
    await Device.create({ id: id, description: id, state: '1' });
    console.log("New divice added:");
    console.log("Device with id: " + id + ", description: " + id + " and relay state: 1");
};

module.exports.findDevices = async () => {
    //console.log("[STORE][findDevices]");
    return await Device.findAll();
};

