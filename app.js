const Homey = require('homey')
const util = require('./lib/util.js')
// const flowActions = require('./lib/flow/actions.js')
// const flowConditions = require('./lib/flow/conditions.js')
const flowTriggers = require('./lib/flow/triggers.js')

class HttpApp extends Homey.App {
  async onInit () {
    flowTriggers.init(this.homey)
    // flowConditions.init()
    // flowActions.init()
  }
}

module.exports = HttpApp
