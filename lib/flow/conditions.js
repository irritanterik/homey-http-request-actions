/* global Homey */
var util = require('../util.js')

exports.init = function () {
  Homey.manager('flow').on('condition.http_get', onConditionHttpGet)
  Homey.manager('flow').on('condition.http_get_json', onConditionHttpGetJson)
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
