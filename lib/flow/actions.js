/* global Homey */
var api = Homey.manager('api')
var betterLogic = new api.App('net.i-dev.betterlogic')
var http = require('http.min')
var util = require('../util.js')
var WebSocket = require('ws')

exports.init = function () {
  Homey.manager('flow').on('action.http_delete', onActionHttpDelete)
  Homey.manager('flow').on('action.http_get', onActionHttpGet)
  Homey.manager('flow').on('action.http_get_json', onActionHttpGetJson)
  Homey.manager('flow').on('action.http_get_variable_1', onActionHttpGetVariable1)
  Homey.manager('flow').on('action.http_get_variable_BetterLogic', onActionHttpGetVariableBetterLogic)
  Homey.manager('flow').on('action.http_get_variable_BetterLogic.betterVariable.autocomplete', onBetterLogicVariableAutocomplete)
  Homey.manager('flow').on('action.http_post_form', onActionHttpPostForm)
  Homey.manager('flow').on('action.http_post_json', onActionHttpPostJson)
  Homey.manager('flow').on('action.http_post_xml', onActionHttpPostXml)
  Homey.manager('flow').on('action.http_put_json', onActionHttpPutJson)
  Homey.manager('flow').on('action.http_request', onActionHttpRequest)
  Homey.manager('flow').on('action.json_evaluate_variable_BetterLogic', onActionJsonEvaluateVariableBetterLogic)
  Homey.manager('flow').on('action.json_evaluate_variable_BetterLogic.betterVariable.autocomplete', onBetterLogicVariableAutocomplete)
  Homey.manager('flow').on('action.json_evaluate_variable_trigger', onActionJsonEvaluateVariableTrigger)
  Homey.manager('flow').on('action.web_socket_send', onActionWebSocketSend)
}

// HTTP Delete request flow action
function onActionHttpDelete (callback, args) {
  util.genericRequestHelper('A10 action.http_delete', 'delete', args, null).then(result => {
    if (result.response.statusCode !== 200) return callback(result.response.statusCode)
    callback(null, true)
  }).catch(callback)
}

function onActionHttpGet (callback, args) {
  util.genericRequestHelper('A20 action.http_get', 'get', args, null).then(result => {
    if (result.response.statusCode !== 200) return callback(result.response.statusCode)
    callback(null, true)
  }).catch(callback)
}

function onActionHttpGetJson (callback, args) {
  util.genericRequestHelper('A21 action.http_get_json', 'get', args, {query: args.data}).then(result => {
    callback(null, result.response.statusCode === 200)
  }).catch(callback)
}

// HTTP Get JSON or XML request flow action
function onActionHttpGetVariable1 (callback, args) {
  util.genericRequestHelper('A23 action.http_get_variable_1', 'get', args, {query: args.data, json: false})
    .then(result => { return util.resolveJsonPath(result.data, args.path) })
    .then(variable => {
      Homey.manager('flow').trigger('http_get_variable_2', {value: variable.toString()}, {trigger: args.trigger})
      callback(null, true)
    })
    .catch(callback)
}

  // HTTP Get JSON or XML request and put in BetterLogic variable flow action
function onActionHttpGetVariableBetterLogic (callback, args) {
  betterLogic.isInstalled(function (err, installed) {
    if (err) return callback('BetterLogic check failed', null)
    if (installed !== true) return callback('BetterLogic is not installed', null)
  })

  util.genericRequestHelper('A22 action.http_get_variable_BetterLogic', 'get', args, {json: false})
    .then(result => { return util.resolveJsonPath(result.data, args.path) })
    .then(variable => {
      variable = escape(variable).replace(/\//g, '%2F')
      util.debugLog('  --> variable result formatted', variable)
      betterLogic.put('/' + args.betterVariable.name + '/' + variable, null, function (err, result) {
        // https://github.com/athombv/homey/issues/714
        if (err) return callback(err)
        callback(null, true)
      })
    })
    .catch(callback)
}

function onBetterLogicVariableAutocomplete (callback, value) {
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
  util.genericRequestHelper('A30 action.http_post_form', 'post', args, {form: args.data}).then(result => {
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
  util.genericRequestHelper('A31 action.http_post_json', 'post', args, {json: args.data}).then(result => {
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
  util.genericRequestHelper('A32 action.http_post_xml', 'post', args, {headers: {'content-type': 'application/xml'}}, args.data).then(result => {
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
  util.genericRequestHelper('A40 action.http_put_json', 'put', args, {json: args.data}).then(result => {
    if (result.response.statusCode === 200) return callback(null, true)
    callback(result.response.statusCode)
  }).catch(callback)
}

  // HTTP Geek Request flow action
function onActionHttpRequest (callback, args) {
  util.debugLog('A90 WARNING: Depricated "HTTP Geek Request" action used. Will be deleted in next version.')
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

// Evaluate JSONpath string and put it in a Better Logic variable
function onActionJsonEvaluateVariableBetterLogic (callback, args) {
  betterLogic.isInstalled(function (err, installed) {
    if (err) return callback('BetterLogic check failed', null)
    if (installed !== true) return callback('BetterLogic is not installed', null)
  })

  util.resolveJsonPath(args.droptoken, args.path).then(variable => {
    variable = escape(variable).replace(/\//g, '%2F')
    util.debugLog('  --> variable result formatted', variable)
    betterLogic.put('/' + args.betterVariable.name + '/' + variable, null, function (err, result) {
      // https://github.com/athombv/homey/issues/714
      if (err) return callback(err)
      callback(null, true)
    })
  }).catch(callback)
}

// Evaluate JSONpath string and trigger step 2
function onActionJsonEvaluateVariableTrigger (callback, args) {
  util.resolveJsonPath(args.droptoken, args.path).then(variable => {
    Homey.manager('flow').trigger('http_get_variable_2', {value: variable.toString()}, {trigger: args.trigger})
    callback(null, true)
  }).catch(callback)
}

  // HTTP Socket flow action
function onActionWebSocketSend (callback, args) {
  util.debugLog('A70 flow action.web_socket_send', {args: args})
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
