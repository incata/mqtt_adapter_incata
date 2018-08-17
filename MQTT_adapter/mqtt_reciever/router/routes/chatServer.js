"use strict";

var _ = require('lodash');
var WebSocketServer = require("ws").Server;
var WebSocketClient = require("ws").Client;
var express = require("express");
var mqtt = require('mqtt');
var aClients = [];
var xsjs  = require("@sap/xsjs");

function MQTTdevice(ws) {
	this.oWSclient = ws;
	this.oMQTTclient = {};
	this.aTopics = [];
	this.connectionOptions = {
		clientId : "",
		connectTimeout : 30000,
		username : "",
		password : ""
	};

	this.device = {
 		alias : "",
		command : "",
		url : "",
		port : "1883",
		clientID : "",
		msg : "",
		topic : "",
		connected : false,
		scanningFlag : false
	};

}
;

function deleteClient(ws) {
	for (var i = 0; i < aClients.length; i++) {
		if (_.isEqual(aClients[i].oWSclient, ws)) {
			aClients.splice(i, 1);
			return;
		}
	}
}


function detectClient(ws) {
	for (var i = 0; i < aClients.length; i++) {
		if (_.isEqual(aClients[i].oWSclient, ws)) {
			return aClients[i];
		}
	}
}

wsClient.prototype.detectDevice = function(device) {

	var oDevice = JSON.parse(device);

	for (var i = 0; i < this.aMQTTdevices.length; i++) {
		debugger;
		if (this.aMQTTdevices[i].device.alias === oDevice.alias) {

			return this.aMQTTdevices[i];
		}
	}
}


MQTTdevice.prototype.getTopicList = function() {
	this.device.scanningFlag = true;
	this.oMQTTclient.subscribe('#', {
		qos : 0
	}, processCallback);
};

function processCallback(err, granted) {
	if (granted) {
		console.log(JSON.stringify(granted));

	} else if (err) {
		console.log(JSON.stringify(err));

	}
}
;

function wsClient(ws) {
	this.aMQTTdevices = [];
	this.oWSclient = ws;
}
;



MQTTdevice.prototype.fReportError = function(message) {
	this.device.command = "error";
	this.device.msg = message;
	this.oWSclient.send(JSON.stringify(this.device));
};

MQTTdevice.prototype.initDevice = function(alias, url, port) {
	this.device.alias = alias;
	this.device.url = url;
	this.device.port = port;
};

MQTTdevice.prototype.initConnectionOptions = function(clientID, user, password) {
	this.connectionOptions.clientID = clientID;
	this.connectionOptions.user = user;
	this.connectionOptions.pass = password;
};


MQTTdevice.prototype.fMQTTconnect = function() {
	this.oMQTTclient = mqtt.connect('mqtt://' + this.device.url + ':' + this.device.port, this.connectionOptions);
	console.log("MQTT connecting...");

	this.oMQTTclient.on('connect', () => {
		console.log("MQTT broker connection accepted");
		this.oWSclient.send("Connected to " + this.device.alias)
		this.device.connected = true;
		this.device.command = "system";
		var oMsg = this.device;
		this.oWSclient.send(JSON.stringify(oMsg));
	});

	this.oMQTTclient.on('reconnect', () => {
		this.oWSclient.send("Reconnecting to " + this.device.alias)
		console.log("trying reconnect");
	});

	this.oMQTTclient.on('error', () => {
		this.oWSclient.send("Error during connecting to " + this.device.alias)
		console.log("error ocurred during connecting");
	});

	this.oMQTTclient.on('close', () => {
		debugger;
		console.log("Disconnected");
		this.oWSclient.send("Disconnected from " + this.device.alias)
		this.device.connected = false;
		this.device.command = "system";
		var oMsg = this.device;
		this.oWSclient.send(JSON.stringify(oMsg));
	});

	this.oMQTTclient.on('message', (topic, message) => {
		if (this.device.scanningFlag === true) {
			if (this.aTopics.length === 0) {
				this.aTopics.push(topic);
			} else if (this.aTopics.length < 15) {
				for (var i = 0; i < this.aTopics.length; i++) {
					if (this.aTopics[i] !== topic) {
						this.aTopics.push(topic);
						break;
					}
				}
			} else {
				this.device.scanningFlag = false;
				this.oMQTTclient.unsubscribe(this.aTopics);
				this.oWSclient.send("Topic scan finished");

				this.device.command = "scanResults";
				this.device.msg = JSON.stringify(this.aTopics);
				var oMsg = this.device;
				this.oWSclient.send(JSON.stringify(oMsg));

			}
		} else {
			for (var i = 0; i < this.aTopics.length; i++) {
				if (topic === this.aTopics[i]) {
					this.device.command = "console";
					this.device.topic = topic;
					this.device.msg = message;
					var oMsg = this.device;
					try {

						this.oWSclient.send(JSON.stringify(oMsg));

					} catch (e) {
						console.log(e);
						this.oMQTTclient.end(true);
						deleteClient(this.oWSclient);
					}

					break;
				}


			}
		}


	});

}





wsClient.prototype.fParseCommands = function(message) {


	var oMQTTdevice = this.detectDevice(message);

	try {

		var recievedCommand = JSON.parse(message);

		switch (recievedCommand.command) {

		case 'MQTTconnect':
			console.log("received: %s", message);
			var oMQTTdevice = new MQTTdevice(this.oWSclient);
			oMQTTdevice.initConnectionOptions(recievedCommand.clientID, recievedCommand.username, recievedCommand.password);
			oMQTTdevice.initDevice(recievedCommand.alias, recievedCommand.url, recievedCommand.port);
			oMQTTdevice.fMQTTconnect();
			this.aMQTTdevices.push(oMQTTdevice);

			break;

		case 'MQTTdisconnect':
			debugger;
			oMQTTdevice.oMQTTclient.unsubscribe(oMQTTdevice.aTopics);
			oMQTTdevice.oMQTTclient.end(true);
			break;
		case 'MQTTscan':
			console.log("scanning started");
			oMQTTdevice.getTopicList();
			console.log(JSON.stringify(this.aTopics));
			break;

		default:
			console.log("received: %s", message);
			break;
		}


	} catch (e) {
		console.log(e);
		oMQTTdevice.fReportError(e);
	}

};



module.exports = function(server) {


	var app = express.Router();
	app.use(function(req, res) {
		var output = "<H1>testNode.js Web Socket </H1></br>" +
			"<a href=\"/exerciseChat\">/test</a> - testowa apka</br>";
		res.type("text/html").status(200).send(output);
	});
	var wss = new WebSocketServer({
		server : server,
		path : "/node/chatServer",
		clientTracking : true
	});
	console.log(JSON.stringify(wss));
	
	xsjs.connect();
	// wss.broadcast = function(data) {
	// wss.clients.forEach(function each(client) {
	// try {
	// client.send(data);
	// } catch (e) {
	// console.log("Broadcast Error: %s", e.toString());
	// }
	// });
	// console.log("sent: %s", data);
	//
	// };

	wss.on("connection", function(ws) {
		ws.on("message", function(message) {

			var oClient = detectClient(ws);

			oClient.fParseCommands(message);

		});
		console.log("someone connected");
		aClients.push(new wsClient(ws));

	});

	return app;
};