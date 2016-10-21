/* global Homey */
module.exports = [
  {
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
  }
]
