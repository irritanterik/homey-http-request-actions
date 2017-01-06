/* global Homey */
var util = require('../util.js')

exports.init = function () {
  Homey.manager('flow').on('trigger.http_get', onTriggerEvent)
  Homey.manager('flow').on('trigger.http_get_variable_2', onTriggerTrigger)
  Homey.manager('flow').on('trigger.full_json', onTriggerTrigger)
  Homey.manager('flow').on('trigger.http_post_variable', onTriggerEvent)
}

function onTriggerEvent (callback, args, state) {
  util.debugLog('Evaluate trigger cards with event value', {args: args, state: state})
  callback(null, args.event.toLowerCase() === state.event.toLowerCase())
}

function onTriggerTrigger (callback, args, state) {
  util.debugLog('Evaluate trigger cards with trigger value', {args: args, state: state})
  callback(null, args.trigger.toLowerCase() === state.trigger.toLowerCase())
}
