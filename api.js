/* global Homey */
function onWhitelist (remoteAddress) {
  var ipv4 = remoteAddress.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g)[0]
  var whitelist = Homey.manager('settings').get('httpWhitelist') || []
  return (whitelist.indexOf(ipv4) !== -1)
}

module.exports = [
  {
    description: 'HTTP Get trigger card (whitelist)',
    method: 'GET',
    path: '/whitelist/:event',
    requires_authorization: false,
    fn: function (callback, args) {
      if (args.req === {}) return callback(`missing request IP`)
      if (!onWhitelist(args.req.remoteAddress)) return callback(`not on whitelist`)
      Homey.manager('flow').trigger('http_get',
        {'value': 'null'},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }, {
    description: 'HTTP Get trigger card with value (whitelist)',
    method: 'GET',
    path: '/whitelist/:event/:value',
    requires_authorization: false,
    fn: function (callback, args) {
      if (!onWhitelist(args.req.remoteAddress)) return callback(`not on whitelist`)
      Homey.manager('flow').trigger('http_get',
        {'value': args.params.value},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }, {
    description: 'HTTP POST trigger card with jsonPath',
    method: 'POST',
    path: '/whitelist/:event',
    requires_authorization: false,
    fn: function (callback, args) {
      if (!onWhitelist(args.req.remoteAddress)) return callback(`not on whitelist`)
      Homey.manager('flow').trigger('http_post_variable',
        {'json': JSON.stringify(args.body)},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }, {
    description: 'HTTP Get trigger card',
    method: 'GET',
    path: '/:event',
    requires_authorization: (Homey.manager('settings').get('httpSettings') === undefined ? true : Homey.manager('settings').get('httpSettings').apiAuthorization),
    fn: function (callback, args) {
      Homey.manager('flow').trigger('http_get',
        {'value': 'null'},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }, {
    description: 'HTTP Get trigger card with value',
    method: 'GET',
    path: '/:event/:value',
    requires_authorization: (Homey.manager('settings').get('httpSettings') === undefined ? true : Homey.manager('settings').get('httpSettings').apiAuthorization),
    fn: function (callback, args) {
      Homey.manager('flow').trigger('http_get',
        {'value': args.params.value},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }, {
    description: 'HTTP POST trigger card with jsonPath',
    method: 'POST',
    path: '/:event',
    requires_authorization: (Homey.manager('settings').get('httpSettings') === undefined ? true : Homey.manager('settings').get('httpSettings').apiAuthorization),
    fn: function (callback, args) {
      Homey.manager('flow').trigger('http_post_variable',
        {'json': JSON.stringify(args.body)},
        {'event': args.params.event}
      )
      callback(null, 'OK')
    }
  }
]
