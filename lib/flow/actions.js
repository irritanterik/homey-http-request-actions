/* global Homey */
var api = Homey.manager('api')
var betterLogic = new api.App('net.i-dev.betterlogic')
var http = require('http.min')
var jsonPath = require('jsonpath-plus')
var parseString = require('xml2js').parseString
var util = require('../util.js')
var WebSocket = require('ws')

exports.init = function () {
  Homey.manager('flow').on('action.http_delete', onActionHttpDelete)
  Homey.manager('flow').on('action.http_get', onActionHttpGet)
  Homey.manager('flow').on('action.http_get_json', onActionHttpGetJson)
  Homey.manager('flow').on('action.http_get_variable_1', onActionHttpGetVariable1)
  Homey.manager('flow').on('action.http_get_variable_BetterLogic', onActionHttpGetVariableBetterLogic)
  Homey.manager('flow').on('action.http_get_variable_BetterLogic.betterVariable.autocomplete', onActionHttpGetVariableBetterLogicBetterVariableAutocomplete)
  Homey.manager('flow').on('action.http_post_form', onActionHttpPostForm)
  Homey.manager('flow').on('action.http_post_json', onActionHttpPostJson)
  Homey.manager('flow').on('action.http_post_xml', onActionHttpPostXml)
  Homey.manager('flow').on('action.http_put_json', onActionHttpPutJson)
  Homey.manager('flow').on('action.http_request', onActionHttpRequest)
  Homey.manager('flow').on('action.web_socket_send', onActionWebSocketSend)
}

// HTTP Delete request flow action
function onActionHttpDelete (callback, args) {
  util.genericRequestHelper('action.http_delete', 'delete', args, null).then(result => {
    if (result.response.statusCode !== 200) return callback(result.response.statusCode)
    callback(null, true)
  }).catch(callback)
}

function onActionHttpGet (callback, args) {
  util.genericRequestHelper('action.http_get', 'get', args, null).then(result => {
    if (result.response.statusCode !== 200) return callback(result.response.statusCode)
    callback(null, true)
  }).catch(callback)
}

function onActionHttpGetJson (callback, args) {
  try {
    var data = JSON.parse(args.data)
  } catch (error) {
    return callback(error)
  }
  util.genericRequestHelper('action.http_get_json', 'get', args, {query: data}).then(result => {
    callback(null, result.response.statusCode === 200)
  }).catch(callback)
}

// HTTP Get JSON or XML request flow action
function onActionHttpGetVariable1 (callback, args) {
  try {
    var data = JSON.parse(args.data)
  } catch (error) {
    return callback(error)
  }
  util.genericRequestHelper('action.http_get_variable_1', 'get', args, {query: data, json: false}).then(result => {
    if (!util.isObject(result.data)) {
      try {
        result.data = JSON.parse(result.data)
      } catch (e) {
        util.debugLog('  --> result is not valid JSON, will try XML now')
        parseString(result.data, function (error, xml2jsResult) {
          if (error) {
            util.debugLog('  --> result is not valid XML')
            return callback('invalid json or xml result')
          }
          result.data = xml2jsResult
        })
      }
    }
    util.debugLog('  --> result from request', result.data)
    var variable = jsonPath({json: result.data, path: args.path, wrap: false})
    util.debugLog('  --> variable result', variable)
    if (variable === null) return callback('Result from jsonPath is null')
    if (util.isObject(variable)) return callback('Result from jsonPath is an Object')
    if (util.isArray(variable)) return callback('Result from jsonPath is an Array')
    Homey.manager('flow').trigger('http_get_variable_2', {value: variable}, {trigger: args.trigger})
    callback(null, true)
  }).catch(callback)
}

  // HTTP Get JSON or XML request and put in BetterLogic variable flow action
function onActionHttpGetVariableBetterLogic (callback, args) {
  betterLogic.isInstalled(function (err, installed) {
    if (err) return callback('BetterLogic check failed', null)
    if (installed !== true) return callback('BetterLogic is not installed', null)
  })

  util.genericRequestHelper('action.http_get_variable_BetterLogic', 'get', args, {json: false}).then(result => {
    if (typeof result.data !== 'object') {
      try {
        result.data = JSON.parse(result.data)
      } catch (e) {
        util.debugLog('  --> result is not valid JSON, will try XML now', result.data)
        parseString(result.data, function (error, xml2jsResult) {
          if (error) {
            util.debugLog('  --> result is not valid XML')
            return callback('invalid json or xml result')
          }
          result.data = xml2jsResult
        })
      }
    }

    util.debugLog('  --> result from request', result.data)
    var variable = jsonPath({json: result.data, path: args.path, wrap: false})
    util.debugLog('  --> variable result', variable)
    if (!variable) return callback('No result from jsonPath')
    if (variable === null) return callback('Result from jsonPath is null')
    if (util.isObject(variable)) return callback('Result from jsonPath is an Object')
    if (util.isArray(variable)) return callback('Result from jsonPath is an Array')
    variable = escape(variable).replace(/\//g, '%2F')
    util.debugLog('  --> variable result formatted', variable)
    betterLogic.put('/' + args.betterVariable.name + '/' + variable, null, function (err, result) {
      if (err) return callback(err)
      callback(null, true)
    })
  }).catch(callback)
}

function onActionHttpGetVariableBetterLogicBetterVariableAutocomplete (callback, value) {
  util.debugLog('betterVariable.autocomplete', {value: value})
  betterLogic.isInstalled(function (err, installed) {
    if (err) return callback('BetterLogic check failed', null)
    if (installed !== true) return callback('BetterLogic is not installed', null)
    betterLogic.get('/ALL', function (err, result) {
      if (err) return util.debugLog('Error returning /ALL', {err: err})
      callback(null, result.filter(filterSupportedVariables(value)))
    })
  })
}
  // HTTP Post form flow action
function onActionHttpPostForm (callback, args) {
  try {
    var data = JSON.parse(args.data)
  } catch (error) {
    return callback(error)
  }
  util.genericRequestHelper('action.http_post_form', 'post', args, {form: data}).then(result => {
    if (result.response.statusCode === 200 ||
        result.response.statusCode === 201 ||
        result.response.statusCode === 202) {
      return callback(null, true)
    }
    callback(result.response.statusCode)
  }).catch(callback)
}

  // HTTP Post XML  request flow action
function onActionHttpPostXml (callback, args) {
  try {
    var data = args.data
  } catch (error) {
    return callback(error)
  }
  util.genericRequestHelperXml('action.http_post_xml', 'post', args, {headers:{'content-type': 'application/xml'}}, data).then(result => {
    if (result.response.statusCode === 200 ||
        result.response.statusCode === 201 ||
        result.response.statusCode === 202) {
      return callback(null, true)
    }
    callback(result.response.statusCode)
  }).catch(callback)
}

  // HTTP Post JSON  request flow action
function onActionHttpPostJson (callback, args) {
  try {
    var data = JSON.parse(args.data)
  } catch (error) {
    return callback(error)
  }
  util.genericRequestHelper('action.http_post_json', 'post', args, {json: data}).then(result => {
    if (result.response.statusCode === 200 ||
        result.response.statusCode === 201 ||
        result.response.statusCode === 202) {
      return callback(null, true)
    }
    callback(result.response.statusCode)
  }).catch(callback)
}

  // HTTP Put request flow action
function onActionHttpPutJson (callback, args) {
  try {
    var data = JSON.parse(args.data)
  } catch (error) {
    return callback(error)
  }
  util.genericRequestHelper('action.http_put_json', 'put', args, {json: data}).then(result => {
    if (result.response.statusCode === 200) return callback(null, true)
    callback(result.response.statusCode)
  }).catch(callback)
}

  // HTTP Geek Request flow action
function onActionHttpRequest (callback, args) {
  util.debugLog('WARNING: Depricated "HTTP Geek Request" action used. Will be deleted in next version.')
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
}

  // HTTP Socket flow action
function onActionWebSocketSend (callback, args) {
  util.debugLog('flow action.web_socket_send', {args: args})
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
      util.debugLog('  --> webSocket Send action completed')
      callback(null, true)
    })
  }).on('error', function (error) {
    util.debugLog('  --> webSocket Send action failed', error)
    callback(error)
  })
}

function filterSupportedVariables (partialWord) {
  return function (element) {
    return element.name.toLowerCase().indexOf(partialWord.query.toLowerCase()) > -1 && (element.type === 'string' || element.type === 'number')
  }
}
