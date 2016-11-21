/* global Homey */
var util = require('../util.js')
var jsonPath = require('jsonpath-plus')
var parseString = require('xml2js').parseString

exports.init = function () {
  Homey.manager('flow').on('condition.http_get', onConditionHttpGet)
  Homey.manager('flow').on('condition.http_get_json', onConditionHttpGetJson)
  Homey.manager('flow').on('condition.http_get_variable', onConditionHttpGetVariable)
}

  // Get request Response flow condition
function onConditionHttpGet (callback, args) {
  util.genericRequestHelper('condition.http_get', 'get', args, null).then(result => {
    callback(null, result.response.statusCode === args.status_code)
  }).catch(callback)
}

  // Get request Response (JSON) flow condition
function onConditionHttpGetJson (callback, args) {
  try {
    var data = JSON.parse(args.data)
  } catch (error) {
    return callback(error)
  }
  util.genericRequestHelper('condition.http_get_json', 'get', args, {query: data}).then(result => {
    callback(null, result.response.statusCode === args.status_code)
  }).catch(callback)
}

function onConditionHttpGetVariable (callback, args) {
  try {
    var data = JSON.parse(args.data)
  } catch (error) {
    return callback(error)
  }
  util.genericRequestHelper('condition.http_get_variable', 'get', args, {query: data, json: false}).then(result => {
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
    callback(null, variable == args.condition)
  }).catch(callback)
}
