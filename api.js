const Homey = require('homey')
const Util = require('./lib/util.js')

var apiAuthorizationPublic = !(Homey.ManagerSettings.get('httpSettings') === null ? true : Homey.ManagerSettings.get('httpSettings').apiAuthorization)

module.exports = [
  {
    description: 'HTTP Get trigger card',
    method: 'GET',
    path: '/:event',
    public: apiAuthorizationPublic,
    fn: async function (args, callback) {
      Util.debugLog('received event GET', args.params)
      const triggerCard = await Homey.app.triggerHttpGet
      triggerCard.trigger(
        {'value': 'null', 'value_num': 0},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }, {
    description: 'HTTP Get trigger card (whitelist)',
    method: 'GET',
    path: '/whitelist/:event',
    public: true,
    fn: async function (args, callback) {
      Util.debugLog('received whitelist event GET', args.params)
      // temp v2 workaround
      // if (args.req === {}) return callback(`missing request IP`)
      // if (!onWhitelist(args.req.remoteAddress)) return callback(`not on whitelist`)
      const triggerCard = await Homey.app.triggerHttpGet
      triggerCard.trigger(
        {'value': 'null', 'value_num': 0},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }, {
    description: 'HTTP Get trigger card with value (whitelist)',
    method: 'GET',
    path: '/whitelist/:event/:value',
    public: true,
    fn: async function (args, callback) {
      Util.debugLog('received whitelist event GET with value', args)
      // temp v2 workaround
      // if (!onWhitelist(args.req.remoteAddress)) return callback(`not on whitelist`)
      const triggerCard = await Homey.app.triggerHttpGet
      triggerCard.trigger(
        {'value': args.params.value, 'value_num': parseFloat(args.params.value)},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }, {
    description: 'HTTP POST trigger card with jsonPath',
    method: 'POST',
    path: '/whitelist/:event',
    public: true,
    fn: async function (args, callback) {
      Util.debugLog('received whitelist event POST', args.params)
      // temp v2 workaround
      // if (!onWhitelist(args.req.remoteAddress)) return callback(`not on whitelist`)
      const triggerCard = await Homey.app.triggerHttpPostVariable
      triggerCard.trigger(
        {'json': JSON.stringify(args.body)},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }, {
    description: 'HTTP Get trigger card with value',
    method: 'GET',
    path: '/:event/:value',
    public: apiAuthorizationPublic,
    fn: async function (args, callback) {
      Util.debugLog('received event GET with value', args.params)
      const triggerCard = await Homey.app.triggerHttpGet
      triggerCard.trigger(
        {'value': args.params.value, 'value_num': parseFloat(args.params.value)},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }, {
    description: 'HTTP POST trigger card with jsonPath',
    method: 'POST',
    path: '/:event',
    public: apiAuthorizationPublic,
    fn: async function (args, callback) {
      Util.debugLog('received event POST', args.params)
      const triggerCard = await Homey.app.triggerHttpPostVariable
      triggerCard.trigger(
        {'json': JSON.stringify(args.body)},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }
]

// function onWhitelist (remoteAddress) {
//   let ipv4 = remoteAddress.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g)[0]
//   let whitelist = Homey.ManagerSettings.get('httpWhitelist') || []
//   return (whitelist.indexOf(ipv4) !== -1)
// }
