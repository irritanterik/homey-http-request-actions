'use strict'

var jsonPath = require('jsonpath-plus')
var http = require('http.min')
var webSocket = require('ws')

function isArray(a) { return (!!a) && (a.constructor === Array)}
function isObject(a) {return (!!a) && (a.constructor === Object)}

function flow_triggers() {
	// Get request flow trigger with value
	Homey.manager('flow').on('trigger.http_get', function( callback, args, state ){
		Homey.log('in flow trigger.http_get with args and state:', args, state)

		if(args.event.toLowerCase() ==  state.event.toLowerCase()){
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
		http.get(args.url).then(function(result){
			callback(null, result.response.statusCode == args.status_code)
		}).catch(function(reason) {
			callback(reason)
		})
	})

	// Get request Response (JSON) flow condition
	Homey.manager('flow').on('condition.http_get_json', function( callback, args ){
		Homey.log('HTTP Get with JSON condition. Passed parameters: ', args)

		try {
			 var data = JSON.parse(args.data)
		} catch(error) {
			 return callback(error)
		}

		http.get({uri: args.url, query: data}).then(function(result){
			callback(null, result.response.statusCode == args.status_code)
		}).catch(function(reason){
			callback(reason)
		})
	})
} // function flow_conditions() end

function flow_actions() {
	// HTTP Delete request flow action
	Homey.manager('flow').on('action.http_delete', function( callback, args ){
		Homey.log('HTTP Delete action. Passed parameter: ', args)
		var url = args.url
		http.delete(url).then(function(result){
			Homey.log('  --> response code:', result.response.statusCode)
			if (result.response.statusCode === 200) {
				callback(null, true)
			} else {
				callback(result.response.statusCode)
			}
		}).catch(function(reason){
			Homey.log('  --> error:', reason)
			callback( reason)
		})
	})

	// HTTP Get request flow action
	Homey.manager('flow').on('action.http_get', function( callback, args ){
		Homey.log('HTTP Get action. Passed parameter: ', args)
		http.get(args.url).then(function(result){
			if (result.response.statusCode === 200) {
				callback(null, true)
			} else {
				callback(result.response.statusCode)
			}
		}).catch(function(reason){
			callback(reason)
		})
	})

	// HTTP Get JSON request flow action
	Homey.manager('flow').on('action.http_get_json', function( callback, args ){
		Homey.log('HTTP Get JSON action. Passed parameter: ', args)
		try {
			 var data = JSON.parse(args.data)
		} catch(error) {
			 return callback(error)
		}

		http.get({uri: args.url, query: data}).then(function(result){
			if (result.response.statusCode === 200) {
				callback(null, true)
			} else {
				callback(result.response.statusCode)
			}
		}).catch(function(reason){
			callback(reason)
		})
	})

	// HTTP Get JSON request flow action
	Homey.manager('flow').on('action.http_get_variable_1', function( callback, args ){
		Homey.log('GET variable step 1 action. Passed parameters: ', args)
		try {
			 var data = JSON.parse(args.data)
		} catch(error) {
			 console.log(' --> error parsing JSON:', error)
			 return callback(error)
		}

		http.get({uri: args.url, query: data, json: true}).then(function(result){
			var variable = jsonPath({json: result.data, path: args.path, wrap: false});
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
				{trigger: args.trigger}
			)
			callback( null, true)
		}).catch(function(reason){
			console.log(' --> error from http.get: ', reason)
			callback(reason)
		})
	})

	// HTTP Post form flow action
	Homey.manager('flow').on('action.http_post_form', function( callback, args ){
		Homey.log('HTTP Post form action. Passed parameters: ', args)
		try {
			 var data = JSON.parse(args.data)
		} catch(error) {
			 return callback(error)
		}

		http.post({uri: args.url, form: data}).then(function(result){
			Homey.log('  --> response code:', result.response.statusCode)
			if (result.response.statusCode === 200
			   || result.response.statusCode === 201
		     || result.response.statusCode === 202) {
				callback(null, true)
			} else {
				callback(result.response.statusCode)
			}
		}).catch(function(reason){
			Homey.log('  --> error:', reason)
			callback(reason)
		})
	})

	// HTTP Post JSON  request flow action
	Homey.manager('flow').on('action.http_post_json', function( callback, args ){
		Homey.log('HTTP Post action. Passed parameters: ', args)
		try {
			 var data = JSON.parse(args.data)
		} catch(error) {
		 	 return callback(error)
		}

		http.post(args.url, data).then(function(result){
			Homey.log('  --> response code:', result.response.statusCode)
			if (result.response.statusCode === 200
			   || result.response.statusCode === 201
		     || result.response.statusCode === 202) {
				callback(null, true)
			} else {
				callback(result.response.statusCode)
			}
		}).catch(function(reason){
			Homey.log('  --> error:', reason)
			callback(reason)
		})
	})

	// HTTP Put request flow action
	Homey.manager('flow').on('action.http_put_json', function( callback, args ){
		Homey.log('HTTP Put action. Passed parameters: ', args)
		try {
			 var data = JSON.parse(args.data)
		} catch(error){
			 return callback(error)
		}
		http.put(args.url, data).then(function(result){
			if (result.response.statusCode === 200) {
				callback(null, true)
			} else {
				callback(result.response.statusCode)
			}
		}).catch(function(reason){
			Homey.log('  --> error:', reason)
			callback(reason)
		})
	})

	// HTTP Geek Request flow action
	Homey.manager('flow').on('action.http_request', function(callback, args){
		Homey.log('HTTP Geek Request action. Passed parameters: ', args)
		var method = 'get'
		try {
			var options = JSON.parse(args.options)
		} catch(error){
			return callback(error)
		}
		if (options.method) method = options.method.toLowerCase()
		http[method](options).then(function(result){
			if (result.response.statusCode === 200) {
				callback(null, true)
			} else {
				callback(result.response.statusCode)
			}
		}).catch(function(reason){
			Homey.log('  --> error:', reason)
			callback(reason)
		})
	})

	// HTTP Socket flow action
	Homey.manager('flow').on('action.web_socket_send', function( callback, args ){
		Homey.log('webSocket Send action. Passed parameters: ', args)
		var url = args.url
	  var data = args.data

		try {
			var ws = new webSocket(url)
		} catch(error) {
			 return callback(error)
		}

		ws.on('open', function() {
		  ws.send(data, function(){
					ws.close()
					Homey.log('  webSocket Send action completed.')
					callback( null, true)
			})
		}).on('error', function(error) {
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
	}
}
