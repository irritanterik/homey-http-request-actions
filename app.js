'use strict'

var jsonPath = require('jsonpath-plus')
//var http = require('http.min')
var request = require('request')
var webSocket = require('ws')
var last_event = ''

function isArray(a) {
    return (!!a) && (a.constructor === Array);
};

function isObject(a) {
    return (!!a) && (a.constructor === Object);
};

function flow_triggers() {
	// Get request flow trigger with value
	Homey.manager('flow').on('trigger.http_get', function( callback, args, state ){
		Homey.log('in flow trigger.http_get with args, state and last_event:', args, state, last_event)

		// change last_event to state.event when flow object is passed correctly
		if(args.event.toLowerCase() ==  last_event.toLowerCase()){
			Homey.log('  --> trigger flow!')
			callback( null, true)
		} else {
			Homey.log('  --> do not trigger flow!')
		  callback( null, false)
		}
	})

	// Get request flow trigger with value
	Homey.manager('flow').on('trigger.http_get_variable_2', function( callback, args, state ){
		Homey.log('in flow trigger.http_get_variable_2 with args and state:', args, state)

		// change last_event to state.event when flow object is passed correctly
		if(args.trigger.toLowerCase() ==  state.trigger.toLowerCase()){
			Homey.log('  --> trigger flow!')
			callback( null, true)
		} else {
			Homey.log('  --> do not trigger flow!')
		  callback( null, false)
		}
	})
} // funtion flow_triggers() end

function flow_conditions() {
	// Get request Response flow condition
	Homey.manager('flow').on('condition.http_get', function( callback, args ){
		Homey.log('HTTP Get condition. Passed parameters: ', args)
		var url = args.url
		var status_code = args.status_code
		request.get({url: url},
			function (error, response, body) {
				if (!error) {
					// ready
					var result = (response.statusCode == status_code)
					callback(null, result )
				} else {
					callback( error )
				}
			}
		)
	})

	// Get request Response (JSON) flow condition
	Homey.manager('flow').on('condition.http_get_json', function( callback, args ){
		Homey.log('HTTP Get with JSON condition. Passed parameters: ', args)
		var url = args.url
		try {
			 var data = JSON.parse(args.data)
		} catch(error) {
			 return callback(error)
		}
		var status_code = args.status_code
		request.get({
			url: url,
			qs: data,
			json: true},
			function (error, response, body) {
				if (!error) {
					// ready
					var result = (response.statusCode == status_code)
					callback(null, result )
				} else {
					Homey.log('HTTP Get with JSON condition. Error in response:', error)
					callback( error )
				}
			}
		)
	})
} // function flow_conditions() end

function flow_actions() {
	// HTTP Delete request flow action
	Homey.manager('flow').on('action.http_delete', function( callback, args ){
		Homey.log('HTTP Delete action. Passed parameter: ', args)
		var url = args.url
		request.del({url: url},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// ready
					callback( null, true)
				} else {
					callback( error )
				}
			}
		)
	})

	// HTTP Get request flow action
	Homey.manager('flow').on('action.http_get', function( callback, args ){
		Homey.log('HTTP Get action. Passed parameter: ', args)
		var url = args.url
		request.get({url: url},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// ready
					callback( null, true)
				} else {
					callback( error )
				}
			}
		)
	})

	// HTTP Get JSON request flow action
	Homey.manager('flow').on('action.http_get_json', function( callback, args ){
		Homey.log('HTTP Get JSON action. Passed parameter: ', args)
		var url = args.url;
		try {
			 var data = JSON.parse(args.data)
		} catch(error) {
			 return callback(error)
		}
		request.get({
			url: url,
			qs: data
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// ready
					callback( null, true)
				} else {
					callback( error )
				}
			}
		)
	})

	// HTTP Get JSON request flow action
	Homey.manager('flow').on('action.http_get_variable_1', function( callback, args ){
		Homey.log('GET variable step 1 action. Passed parameters: ', args)
		var url = args.url
		try {
			 var data = JSON.parse(args.data)
		} catch(error) {
			 return callback(error)
		}
		var path = args.path
		var trigger = args.trigger

		request.get({
			url: url,
			qs: data,
			json: true
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					//https://jsonpath.curiousconcept.com/
					var variable = jsonPath({json: body, path: path, wrap: false});
					console.log('Variable is ', variable)

					if (variable == null ) {
						console.log('variable == null')
						callback('Result from jsonPath is null')
						return
					}
					if (isObject(variable)) {
						console.log('variable is an Object')
						callback('Result from jsonPath is an Object')
						return
					}
					if (isArray(variable)) {
						console.log('variable is an Array')
						callback('Result from jsonPath is an Array')
						return
					}

					Homey.manager('flow').trigger('http_get_variable_2',
						{value: variable},
						{trigger: trigger}
					)
					callback( null, true)

				} else {
					callback( error )
				}
			}
		)
	})

	// HTTP Post form flow action
	Homey.manager('flow').on('action.http_post_form', function( callback, args ){
		Homey.log('HTTP Post form action. Passed parameters: ', args)
		var url = args.url
		try {
			 var data = JSON.parse(args.data)
		} catch(error) {
			 return callback(error)
		}
		Homey.log('  JSON parsed data: ', data)

		request({
			url: url,
			method: 'POST',
			form: data
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// ready
					callback( null, true)
				} else {
					Homey.log('  HTTP Post form action. Error in response:', error, response)
					callback( error )
				}
			}
		)
	})

	// HTTP Post JSON  request flow action
	Homey.manager('flow').on('action.http_post_json', function( callback, args ){
		Homey.log('HTTP Post action. Passed parameters: ', args)
		var url = args.url
		try {
			 var data = JSON.parse(args.data)
		} catch(error) {
			 return callback(error)
		}
		Homey.log('  JSON parsed data: ', data)

		request({
			url: url,
			method: 'POST',
			json: data
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// ready
					callback( null, true)
				} else {
					Homey.log('  HTTP Post action. Error in response:', error, response)
					callback( error )
				}
			}
		)
	})

	// HTTP Put request flow action
	Homey.manager('flow').on('action.http_put_json', function( callback, args ){
		Homey.log('HTTP Put action. Passed parameters: ', args)
		var url = args.url
		try {
			 var data = JSON.parse(args.data)
		} catch(error){
			 return callback(error)
		}
		request({
			url: url,
			method: 'PUT',
			json: data},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// ready
					callback( null, true)
				} else {
					callback( error )
				}
			}
		)
	})

	// HTTP Socket flow action
	Homey.manager('flow').on('action.web_socket_send', function( callback, args ){
		Homey.log('webSocket Send action. Passed parameters: ', args)
		var url = args.url
	  var data = args.data
		var ws = new webSocket(url)

		ws.on('open', function() {
		  ws.send(data, function(){
					ws.close()
					Homey.log('  webSocket Send action completed.')
					callback( null, true)
			})
		})

		ws.on('error', function(error) {
			Homey.log('  webSocket Send action failed:', error)
			callback(error)
		})
	})
} // function flow_actions() end

var self = module.exports = {
	init: function () {
		flow_triggers()
		flow_conditions()
		flow_actions()
	},
	trigger: function(event, value) {
		last_event = event // ugly global
		Homey.manager('flow').trigger('http_get'
			,{'value': value}
			,{'event': event}
		)
	}
}
