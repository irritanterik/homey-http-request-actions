/* global Homey */
'use strict'

var flowActions = require('./lib/flow/actions.js')
var flowConditions = require('./lib/flow/conditions.js')
var flowTriggers = require('./lib/flow/triggers.js')
var util = require('./lib/util.js')

module.exports = {
  init: function () {
    util.debugLog('Api Authorization Required setting', (Homey.manager('settings').get('httpSettings') === undefined ? true : Homey.manager('settings').get('httpSettings').apiAuthorization))

    flowTriggers.init()
    flowConditions.init()
    flowActions.init()
  }
}
