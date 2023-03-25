const Homey = require('homey')
const util = require('./lib/util.js')
const flowActions = require('./lib/flow/actions.js')
const flowConditions = require('./lib/flow/conditions.js')
const flowTriggers = require('./lib/flow/triggers.js')

class HttpApp extends Homey.App {
  async onInit () {
    const betterLogicApp = this.homey.api.getApiApp('net.i-dev.betterlogic')
    let betterLogicIsInstalled = await betterLogicApp.getInstalled()
    
    if (betterLogicIsInstalled) {
      let betterLogicVersion = await betterLogicApp.getVersion()
      console.log('Better logic app installed, version ', betterLogicVersion)
    } else {
      console.log('Better logic app not installed')
    }

    flowTriggers.init(this.homey)
    flowConditions.init(this.homey)
    flowActions.init(this.homey)
  }
}

module.exports = HttpApp
