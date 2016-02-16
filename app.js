"use strict";

var request = require("request");
var express = require("express");
var port = 9090;
var last_event = "";

function start_server() {
	var app = express();

	// listen for event and value
	app.get("/:event/:value", function (req, res) {
		var event = req.params.event;
		var value = req.params.value;
		last_event = event; // temp until flow object is passed correctly
		Homey.log("HTTP event/value request received with parameters: ", req.params)
		Homey.manager("flow").trigger("http_get"
			,{"value": value}
			,{"event": event}
		);
		res.send("OK")
  });

	// listen for name only
	app.get("/:event", function (req, res) {
		var event = req.params.event;
		last_event = event; // temp until flow object is passed correctly
		Homey.log("HTTP event request received with parameters: ", req.params)
		Homey.manager("flow").trigger("http_get"
			,{"value": null}
			,{"event": event}
		);
		res.send("OK")
  });

	var server = app.listen(port, function(){
		Homey.log("HTTP Api listening at: " + port);
	});
} // function start_server() end

function flow_triggers() {
	// Get Request flow trigger with value
	Homey.manager("flow").on("trigger.http_get", function( callback, args, state ){
		Homey.log("in flow trigger.http_get with args and state:", args, state);

		// change last_event to state.event when flow object is passed correctly
		if(args.event.toLowerCase() ==  last_event.toLowerCase()){
			callback( null, true);
		} else {
		  callback( null, false);
		}
	});
} // funtion flow_triggers() end

function flow_conditions() {
	// Get Request Response flow condition
	Homey.manager("flow").on("condition.http_get", function( callback, args ){
		Homey.log("HTTP Get condition. Passed parameters: ", args);
		var url = args.url;
		var status_code = args.status_code;
		request.get({url: url},
			function (error, response, body) {
				if (!error) {
					// ready
					var result = (response.statusCode == status_code);
					callback(null, result );
				} else {
					callback( error );
				}
			}
		);
	});

	// Get Request Response (JSON) flow condition
	Homey.manager("flow").on("condition.http_get_json", function( callback, args ){
		Homey.log("HTTP Get with JSON condition. Passed parameters: ", args);
		var url = args.url;
		try {
			 var data = JSON.parse(args.data);
		} catch(error) {
			 return callback(error);
		}
		var status_code = args.status_code;
		request.get({
			url: url,
			qs: data,
			json: true},
			function (error, response, body) {
				if (!error) {
					// ready
					var result = (response.statusCode == status_code);
					callback(null, result );
				} else {
					Homey.log("HTTP Get with JSON condition. Error in response:", error)
					callback( error );
				}
			}
		);
	});
} // function flow_conditions() end

function flow_actions() {
	// HTTP Delete Request flow action
	Homey.manager("flow").on("action.http_get", function( callback, args ){
		Homey.log("HTTP Delete action. Passed parameter: ", args);
		var url = args.url;
		request.del({url: url},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// ready
					callback( null, true);
				} else {
					callback( error );
				}
			}
		);
	});

	// HTTP Get Request flow action
	Homey.manager("flow").on("action.http_get", function( callback, args ){
		Homey.log("HTTP Get action. Passed parameter: ", args);
		var url = args.url;
		request.get({url: url},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// ready
					callback( null, true);
				} else {
					callback( error );
				}
			}
		);
	});

	// HTTP Get JSON Request flow action
	Homey.manager("flow").on("action.http_get_json", function( callback, args ){
		Homey.log("HTTP Get JSON action. Passed parameter: ", args);
		var url = args.url;
		try {
			 var data = JSON.parse(args.data);
		} catch(error) {
			 return callback(error);
		}
		request.get({
			url: url,
			qs: data
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// ready
					callback( null, true);
				} else {
					callback( error );
				}
			}
		);
	});

	// HTTP Post JSON  Request flow action
	Homey.manager("flow").on("action.http_post_json", function( callback, args ){
		Homey.log("HTTP Post action. Passed parameters: ", args);
		var url = args.url;
		try {
			 var data = JSON.parse(args.data);
		} catch(error) {
			 return callback(error);
		}

		request({
			url: url,
			method: "POST",
			json: data
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// ready
					callback( null, true);
				} else {
					Homey.log("HTTP Post action. Error in response:", error, response)
					callback( error );
				}
			}
		);
	});

	// HTTP Put Request flow action
	Homey.manager("flow").on("action.http_put_json", function( callback, args ){
		Homey.log("HTTP Put action. Passed parameters: ", args);
		var url = args.url;
		try {
			 var data = JSON.parse(args.data);
		} catch(error){
			 return callback(error);
		}
		request({
			url: url,
			method: "PUT",
			json: data},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// ready
					callback( null, true);
				} else {
					callback( error );
				}
			}
		);
	});
} // function flow_actions() end

var self = module.exports = {
	init: function () {
		start_server();
		flow_triggers();
		flow_conditions();
		flow_actions();
	}
}
