/* global Homey */
'use strict'
var jsonPath = require('jsonpath-plus')
var http = require('http.min')
var WebSocket = require('ws')
var parseString = require('xml2js').parseString
var api = Homey.manager('api')
var betterLogic = new api.App('net.i-dev.betterlogic')

function isArray (a) { return (!!a) && (a.constructor === Array) }
function isObject (a) { return (!!a) && (a.constructor === Object) }
function filterSupportedVariables (partialWord) {
  return function (element) {
    return element.name.toLowerCase().indexOf(partialWord.query.toLowerCase()) > -1 && (element.type === 'string' || element.type === 'number')
  }
}
function debugLog (event, data) {
  var time = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
  if (!data) {
    data = null
    Homey.log(time, event)
  } else {
    Homey.log(time, event, data)
  }
  Homey.manager('api').realtime(event, data)
} // function debugLog

function mergeOptional (dest, src) {
  for (var k in src) {
    if (!(k in dest)) dest[k] = src[k]
  }
} // function mergeOptional

function createUrlOptions (input, mergeOptions) {
  // check for json options vs url
  var result
  try {
    result = JSON.parse(input)
  } catch (e) {
    result = {uri: input}
  }
  if (mergeOptions) mergeOptional(result, mergeOptions)
  mergeOptional(result, {timeout: 30000})
  return result
} // function createUrlOptions

function genericRequestHelper (flow, defaultMethod, args, mergeOptions, callback) {
  var method = defaultMethod
  var urlOptions = createUrlOptions(args.url, mergeOptions)
  if (urlOptions.method) method = urlOptions.method.toLowerCase()
  debugLog(flow, {args: args, method: method, urlOptions: urlOptions})
  http[method](urlOptions).then(function (result) {
    callback(null, result)
  }).catch(function (error) {
    debugLog(flow + ' failed', {error: error, stack: error.stack})
    callback(error)
  })
} // function genericRequestHelper

function autocomplete () {
  Homey.manager('flow').on('action.http_get_variable_BetterLogic.betterVariable.autocomplete', function (callback, value) {
    debugLog('betterVariable.autocomplete', {value: value})
    betterLogic.isInstalled(function (err, installed) {
      if (err) return callback('BetterLogic check failed', null)
      if (installed !== true) return callback('BetterLogic is not installed', null)
      betterLogic.get('/ALL', function (err, result) {
        if (err) return debugLog('Error returning /ALL', {err: err})
        callback(null, result.filter(filterSupportedVariables(value)))
      })
    })
  })
} // function autocomplete

function flow_triggers () {
  // Get request flow trigger with value
  Homey.manager('flow').on('trigger.http_get', function (callback, args, state) {
    debugLog('flow trigger.http_get evaluation', {args: args, state: state})
    callback(null, args.event.toLowerCase() === state.event.toLowerCase())
  })

  // Get request flow trigger with value
  Homey.manager('flow').on('trigger.http_get_variable_2', function (callback, args, state) {
    debugLog('flow trigger.http_get_variable_2 evaluation', {args: args, state: state})
    callback(null, args.trigger.toLowerCase() === state.trigger.toLowerCase())
  })
} // funtion flow_triggers

function flow_conditions () {
  // Get request Response flow condition
  Homey.manager('flow').on('condition.http_get', function (callback, args) {
    genericRequestHelper('condition.http_get', 'get', args, null, function (error, result) {
      if (error) return callback(error)
      callback(null, result.response.statusCode === args.status_code)
    })
  })

  // Get request Response (JSON) flow condition
  Homey.manager('flow').on('condition.http_get_json', function (callback, args) {
    try {
      var data = JSON.parse(args.data)
    } catch (error) {
      return callback(error)
    }
    genericRequestHelper('condition.http_get_json', 'get', args, {query: data}, function (error, result) {
      callback(error, result.response.statusCode === args.status_code)
    })
  })
} // function flow_conditions

function flow_actions () {
  // HTTP Delete request flow action
  Homey.manager('flow').on('action.http_delete', function (callback, args) {
    genericRequestHelper('action.http_delete', 'delete', args, null, function (error, result) {
      if (error) return callback(error)
      if (result.response.statusCode !== 200) return callback(result.response.statusCode)
      callback(null, true)
    })
  })

  // HTTP Get request flow action
  Homey.manager('flow').on('action.http_get', function (callback, args) {
    genericRequestHelper('action.http_get', 'get', args, null, function (error, result) {
      if (error) return callback(error)
      if (result.response.statusCode !== 200) return callback(result.response.statusCode)
      callback(null, true)
    })
  })

  // HTTP Get JSON request flow action
  Homey.manager('flow').on('action.http_get_json', function (callback, args) {
    try {
      var data = JSON.parse(args.data)
    } catch (error) {
      return callback(error)
    }
    genericRequestHelper('action.http_get_json', 'get', args, {query: data}, function (error, result) {
      callback(error, result.response.statusCode === 200)
    })
  })

  // HTTP Get JSON or XML request flow action
  Homey.manager('flow').on('action.http_get_variable_1', function (callback, args) {
    try {
      var data = JSON.parse(args.data)
    } catch (error) {
      return callback(error)
    }
    genericRequestHelper('action.http_get_variable_1', 'get', args, {query: data, json: false}, function (error, result) {
      if (error) return callback(error)
      if (typeof result.data !== 'object') {
        try {
          result.data = JSON.parse(result.data)
        } catch (e) {
          debugLog('  --> result is not valid JSON, will try XML now')
          parseString(result.data, function (error, xml2jsResult) {
            if (error) {
              debugLog('  --> result is not valid XML')
              return callback('invalid json or xml result')
            }
            result.data = xml2jsResult
          })
        }
      }
      debugLog('  --> result from request', result.data)
      var variable = jsonPath({json: result.data, path: args.path, wrap: false})
      debugLog('  --> variable result', variable)
      if (variable === null) return callback('Result from jsonPath is null')
      if (isObject(variable)) return callback('Result from jsonPath is an Object')
      if (isArray(variable)) return callback('Result from jsonPath is an Array')
      Homey.manager('flow').trigger('http_get_variable_2', {value: variable}, {trigger: args.trigger})
      callback(null, true)
    })
  })

  // HTTP Get JSON or XML request and put in BetterLogic variable flow action
  Homey.manager('flow').on('action.http_get_variable_BetterLogic', function (callback, args) {
    betterLogic.isInstalled(function (err, installed) {
      if (err) return callback('BetterLogic check failed', null)
      if (installed !== true) return callback('BetterLogic is not installed', null)
    })

    genericRequestHelper('action.http_get_variable_BetterLogic', 'get', args, {json: false}, function (error, result) {
      if (error) return callback(error)
      if (typeof result.data !== 'object') {
        try {
          result.data = JSON.parse(result.data)
        } catch (e) {
          debugLog('  --> result is not valid JSON, will try XML now', result.data)
          parseString(result.data, function (error, xml2jsResult) {
            if (error) {
              debugLog('  --> result is not valid XML')
              return callback('invalid json or xml result')
            }
            result.data = xml2jsResult
          })
        }
      }

      debugLog('  --> result from request', result.data)
      var variable = jsonPath({json: result.data, path: args.path, wrap: false})
      debugLog('  --> variable result', variable)
      if (!variable) return callback('No result from jsonPath')
      if (variable === null) return callback('Result from jsonPath is null')
      if (isObject(variable)) return callback('Result from jsonPath is an Object')
      if (isArray(variable)) return callback('Result from jsonPath is an Array')
      variable = escape(variable).replace(/\//g, '%2F');
      debugLog('  --> variable result formatted', variable)
      betterLogic.put('/' + args.betterVariable.name + '/' + variable) //, {}, function (err, result) {
        // if (err) return callback(err)
        callback(null, true)
      // })
    })
  })

  // HTTP Post form flow action
  Homey.manager('flow').on('action.http_post_form', function (callback, args) {
    try {
      var data = JSON.parse(args.data)
    } catch (error) {
      return callback(error)
    }
    genericRequestHelper('action.http_post_form', 'post', args, {form: data}, function (error, result) {
      if (error) return callback(error)
      if (result.response.statusCode === 200 ||
        result.response.statusCode === 201 ||
        result.response.statusCode === 202) {
        callback(null, true)
      } else {
        callback(result.response.statusCode)
      }
    })
  })

  // HTTP Post JSON  request flow action
  Homey.manager('flow').on('action.http_post_json', function (callback, args) {
    try {
      var data = JSON.parse(args.data)
    } catch (error) {
      return callback(error)
    }
    genericRequestHelper('action.http_post_json', 'post', args, {json: data}, function (error, result) {
      if (error) return callback(error)
      if (result.response.statusCode === 200 ||
        result.response.statusCode === 201 ||
        result.response.statusCode === 202) {
        callback(null, true)
      } else {
        callback(result.response.statusCode)
      }
    })
  })

  // HTTP Put request flow action
  Homey.manager('flow').on('action.http_put_json', function (callback, args) {
    try {
      var data = JSON.parse(args.data)
    } catch (error) {
      return callback(error)
    }
    genericRequestHelper('action.http_put_json', 'put', args, {json: data}, function (error, result) {
      if (error) return callback(error)
      if (result.response.statusCode === 200) {
        callback(null, true)
      } else {
        callback(result.response.statusCode)
      }
    })
  })

  // HTTP Geek Request flow action
  Homey.manager('flow').on('action.http_request', function (callback, args) {
    debugLog('WARNING: Depricated "HTTP Geek Request" action used. Will be deleted in next version.')
    var method = 'get'
    try {
      var options = JSON.parse(args.options)
    } catch (error) {
      return callback(error)
    }
    if (options.method) method = options.method.toLowerCase()
    http[method](options).then(function (result) {
      if (result.response.statusCode === 200) {
        callback(null, true)
      } else {
        callback(result.response.statusCode)
      }
    }).catch(function (reason) {
      callback(reason)
    })
  })

  // HTTP Socket flow action
  Homey.manager('flow').on('action.web_socket_send', function (callback, args) {
    debugLog('flow action.web_socket_send', {args: args})
    var url = args.url
    var data = args.data
    try {
      var ws = new WebSocket(url)
    } catch (error) {
      return callback(error)
    }
    ws.on('open', function () {
      ws.send(data, function () {
        ws.close()
        debugLog('  --> webSocket Send action completed')
        callback(null, true)
      })
    }).on('error', function (error) {
      debugLog('  --> webSocket Send action failed', error)
      callback(error)
    })
  })
} // function flow_actions() end

var self = module.exports = {
  init: function () {
    debugLog('Api Authorization Required setting', (Homey.manager('settings').get('httpSettings') === undefined ? true : Homey.manager('settings').get('httpSettings').apiAuthorization))
    flow_triggers()
    flow_conditions()
    flow_actions()
    autocomplete()
  }
}
