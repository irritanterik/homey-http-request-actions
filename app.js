"use strict";

var request = require('request');

var self = module.exports = {
	init: function () {
		// HTTP Get Request flow condition
		Homey.manager('flow').on('condition.http_get', function( callback, args ){
			Homey.log("HTTP Get condition. Passed parameters: ", args);
			var url = args.url;
			var status_code = args.status_code;
			request.get(
				url,
				{},
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

		// HTTP Delete Request flow action
		Homey.manager('flow').on('action.http_get', function( callback, args ){
			Homey.log("HTTP Delete action. Passed parameter: ", args);
			var url = args.url;
			request.del(
				url,
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
		Homey.manager('flow').on('action.http_get', function( callback, args ){
			Homey.log("HTTP Get action. Passed parameter: ", args);
			var url = args.url;
			request.get(
				url,
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

		// HTTP Post JSON  Request flow action
		Homey.manager('flow').on('action.http_post_json', function( callback, args ){
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
						callback( error );
					}
				}
			);
		});

		// HTTP Put Request flow action
		Homey.manager('flow').on('action.http_put_json', function( callback, args ){
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
	}
}
