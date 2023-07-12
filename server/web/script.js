const socket = io({
    transports: ['websocket']
});
//var nSockets = require('./server');


socket.on('userConnected', (socketId) => {  
    console.log("Connected to server with socket id: " + socketId);
}).on('deviceConnected', (payload) => {

    console.log("Device with id: "+payload.id + " and description: " +payload.description + " has been connected");
    alert("El dispositivo con id: "+payload.id + " y descripción: " +payload.description + " se ha conectado",0);
}).on('sendRelayState', (payload) => {
    const deviceElement = document.getElementById(payload.id);
    deviceElement.setAttribute("state", payload.state);
    console.log("Updated state to " + payload.state + " of divice with id: " + payload.id);
    const textElement = deviceElement.getElementsByClassName("stateText")[0];
    updateStateText(payload.state, textElement);
}).on('mqttDisconnected', (payload) => {
    console.log("MQTT is not connected properly");
    console.log(payload.matter)
    var messageMatter="";
    if(payload.matter===0){
        messageMatter= " No es posible cambiar el estado del relé del dispositivo con id: "+payload.id;
        console.log("Cannot switch the relay state of device " +payload.id);
    }else if(payload.matter===1){//led
        messageMatter= " No es posible cambiar el estado del led del dispositivo con id: "+payload.id;
        console.log("Cannot switch the relay state of device " +payload.id);
    }else{
        messageMatter="";
    }
    console.log(messageMatter);
    alert("MQTT no está conectado de manera correcta."+messageMatter,1);
}).on('deviceDisconnected', (payload) => {
    console.log("Device with id: "+payload.id + " and description: " +payload.description + " has been disconnected");
    alert("El dispositivo con id: "+payload.id + " y descripción: " +payload.description + " se ha desconectado",1);
});


sendRequest('GET', '/api/devices', null).then((devices) => {
    for (const device of devices) {
        const template = document.getElementsByClassName("template")[0];
        const deviceElement = template.cloneNode(true); //true copia tb hijos
        deviceElement.classList.remove("d-none", "template");
        deviceElement.setAttribute("id", device.id);
        deviceElement.setAttribute("state", device.state);
        console.log("Representing device with id: " + device.id);
        deviceElement.getElementsByClassName("form-control")[0].value = device.description;


        const textElement = deviceElement.getElementsByClassName("textState")[0];
        updateStateText(device.state, textElement);


        deviceElement.getElementsByClassName("btn-outline-secondary")[0].onclick = () => {
            updateDescription(device);
        }
        deviceElement.getElementsByClassName("led")[0].onclick = () => {
            switchLed(device);
        }

        deviceElement.getElementsByClassName("relay")[0].onclick = () => {    
            switchRelay(device);
        }

        document.getElementsByClassName("devices")[0].appendChild(deviceElement); //Agrega un nuevo nodo al final de la lista de un elemento hijo de un elemento padre especificado.

    }
})
function alert(message,matter){
    //const disconnectImage=document.getElementById("disconnected");
    //const connectImage=document.getElementById("connected");

    document.getElementById("disconnected").style.display = "none";
    document.getElementById("connected").style.display = "none";

    
    //disconnectImage.setAttribute("visibility", "hidden");
    //connectImage.setAttribute("visibility", "hidden");
    const title= document.getElementsByClassName("alertTitle")[0];
    switch (matter) {
    case 0:
        console.log("conectado");
        //connectImage.setAttribute("visibility", "visible");
        document.getElementById("connected").style.display = "block";
        title.innerText="Conexión";
      break;
    case 1:
        console.log("desconectado");
        //disconnectImage.setAttribute("visibility", "visible");
        document.getElementById("disconnected").style.display = "block";
        title.innerText="Desconexión";
      break;
    
    default:
      
      break;
    }
    document.getElementsByClassName("alertBody")[0].innerText = message;
    $('#myModal').modal('show');

};

async function updateDescription(device) {
    //console.log("[updateDescription]");
    try {
        const deviceElement = document.getElementById(device.id);
        console.log(deviceElement);
        const newDescription = deviceElement.getElementsByClassName("form-control")[0].value;
        console.log("Sending updating description for");
        console.log("divice: " + device.id + "with new description: " + newDescription);
        await sendRequest('PATCH', '/api/updateDescription/' + device.id, {
            description: newDescription
        });
    } catch (error) {
        //alert(device,"Cannot update description of divice "+device.id);  //CAMBIARLOOOO
        console.log(error);
    }
};

async function switchLed(device) {
    //console.log("[switchLed]");
    try {
        console.log("Sending switching led for divice: " + device.id);
        await sendRequest('POST', '/api/switchLed/' + device.id, {});
    } catch (error) {
        console.log(error);

    }
};

async function switchRelay(device) {
    //console.log("[switchRelay]");
    try {
        const deviceElement = document.getElementById(device.id);
        const state =deviceElement.getAttribute("state");
        console.log("Sending switching relay for divice: " + device.id + " with current state: " + state);
        if (state === "1") {
            await sendRequest('POST', '/api/switchRelay/' + device.id, {
                state: "0"
            });
        } else if (state === "0") {
            await sendRequest('POST', '/api/switchRelay/' + device.id, {
                state: "1"
            });
        } else {
            console.log("Error switching relay");
        }
    } catch (error) {
        console.log(error);

    }
}

function updateStateText(state, textElement) {
    if (state === "1") {
        textElement.innerText = "OFF";
    } else if (state === "0") {
        textElement.innerText = "ON";
    } else {
        console.log("error");
    }
};

function sendRequest(method, url, body) {
    return new Promise((resolve, reject) => { //segundo plano
        console.log("XML Http Request with method: " + method + ", url: " + url + ", body: " + JSON.stringify(body));
        const req = new XMLHttpRequest();
        req.open(method, url, true);
        req.setRequestHeader("Content-Type", "application/json");


        req.onreadystatechange = function (aEvt) {
            if (req.readyState == 4) {
                console.log("XML Http Request with state: " + req.status);
                if (req.status == 200) {
                    resolve(JSON.parse(req.responseText));
                }
                else if (req.status == 204) {
                    resolve();
                }
                else {
                    reject("Error loading page\n");
                }
            }
        };
        req.send(JSON.stringify(body));
    });
}


