//eslint no-console: 0, no-unused-vars: 0, no-undef:0/
 /*eslint-env node, es6 */

"use strict";


var https = require("https");
var port  = process.env.PORT || 3000;
var server = require("http").createServer();
var express = require("express");
 
//Initialize Express App for XS UAA and HDBEXT Middleware
var app = express();  


//Setup Routes
var router = require("./router")(app, server);

//Start the Server
server.on("request", app);
server.listen(port, function() {
console.log("HTTP Server:" + port);
});

