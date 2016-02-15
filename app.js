"use strict";

var request = require('request');

var self = module.exports = {
	init: function () {
		// HTTP Get Request flow action
		Homey.manager('flow').on('action.http_get', function( callback, args ){
			Homey.log("Http Get action. Passed parameter: ", args);
			var url = args.url;
			request.get(
				url,
				{},
				function (error, response, body) {
					if (!error && response.statusCode == 200) {
						// ready
						callback( null, true);
					} else {
						callback( error )
					}
				}
			)
		});

		// HTTP Post JSON  Request flow action
		Homey.manager('flow').on('action.http_post_json', function( callback, args ){
			Homey.log("Http Post action. Passed parameters: ", args);
			var url = args.url;
			try {
			   var data = JSON.parse(args.data);
			catch(error){
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
						callback( error )
					}
				}
			)
		});

		// HTTP Put Request flow action
		Homey.manager('flow').on('action.http_put_json', function( callback, args ){
			Homey.log("Http Put action. Passed parameters: ", args);
			var url = args.url;
			try {
			   var data = JSON.parse(args.data);
			catch(error){
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
						callback( error )
					}
				}
			)
		});
	}
}
