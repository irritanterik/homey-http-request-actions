/* global Homey */
var util = require('../util.js')

exports.init = function () {
  Homey.manager('flow').on('trigger.http_get', onTriggerHttpGet)
  Homey.manager('flow').on('trigger.http_get_variable_2', onTriggerHttpGetVariable2)
  Homey.manager('flow').on('trigger.http_post_variable', onTriggerHttpPostVariable)
}

  // Get request flow trigger with value
function onTriggerHttpGet (callback, args, state) {
  util.debugLog('flow trigger.http_get evaluation', {args: args, state: state})
  callback(null, args.event.toLowerCase() === state.event.toLowerCase())
}

  // Get request flow trigger with value
function onTriggerHttpGetVariable2 (callback, args, state) {
  util.debugLog('flow trigger.http_get_variable_2 evaluation', {args: args, state: state})
  callback(null, args.trigger.toLowerCase() === state.trigger.toLowerCase())
}

function onTriggerHttpPostVariable (callback, args, state) {
  util.debugLog('flow trigger.http_post_variable', {args: args, state: state})
  callback(null, args.event.toLowerCase() === state.event.toLowerCase())
}
