/* global Homey */
var util = require('../util.js')

exports.init = function () {
  Homey.manager('flow').on('condition.http_get', onConditionHttpGet)
  Homey.manager('flow').on('condition.http_get_json', onConditionHttpGetJson)
  Homey.manager('flow').on('condition.http_get_variable', onConditionHttpGetVariable)
  Homey.manager('flow').on('condition.json_evaluate', onConditionJsonEvaluate)
}

  // Get request Response flow condition
function onConditionHttpGet (callback, args) {
  util.genericRequestHelper('C20 condition.http_get', 'get', args, null)
    .then(result => { callback(null, result.response.statusCode === args.status_code) })
    .catch(callback)
}

  // Get request Response (JSON) flow condition
function onConditionHttpGetJson (callback, args) {
  try {
    var data = JSON.parse(args.data)
  } catch (error) {
    return callback(error)
  }
  util.genericRequestHelper('C21 condition.http_get_json', 'get', args, {query: data})
    .then(result => { callback(null, result.response.statusCode === args.status_code) })
    .catch(callback)
}

function onConditionHttpGetVariable (callback, args) {
  try {
    var data = JSON.parse(args.data)
  } catch (error) {
    return callback(error)
  }
  util.genericRequestHelper('C22 condition.http_get_variable', 'get', args, {query: data, json: false})
    .then(result => { return util.resolveJsonPath(result.data, args.path) })
    .then(variable => { callback(null, variable.toString() === args.condition.toString()) })
    .catch(callback)
}

function onConditionJsonEvaluate (callback, args) {
  util.resolveJsonPath(args.droptoken, args.path)
    .then(variable => { callback(null, variable.toString() === args.condition.toString()) })
    .catch(callback)
}
