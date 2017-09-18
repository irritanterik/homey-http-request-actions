'use strict'

const Homey = require('homey')
const util = require('./lib/util.js')
const flowActions = require('./lib/flow/actions.js')
const flowConditions = require('./lib/flow/conditions.js')
const flowTriggers = require('./lib/flow/triggers.js')

class HttpApp extends Homey.App {
  onInit () {
    util.debugLog('Api Authorization Required setting', {value: (Homey.ManagerSettings.get('httpSettings') === null ? true : Homey.ManagerSettings.get('httpSettings').apiAuthorization)})

    flowTriggers.init()
    flowConditions.init()
    flowActions.init()
  }
}

module.exports = HttpApp
