const Homey = require('homey')
const Util = require('./lib/util.js')

module.exports = {
  async triggerCardGet({homey, params}) {
    Util.debugLog('received event triggerCardGet', params)

    const triggerCard = homey.flow.getTriggerCard('http_get');
    return await triggerCard.trigger(
      {'value': 'null', 'value_num': 0},
      {'event': params.event}
    )
  },
  async triggerCardGetVar({homey, params, query}) {
    Util.debugLog('received event triggerCardGetVar', {params, query})

    const triggerCard = homey.flow.getTriggerCard('http_get');
    return await triggerCard.trigger(
      {'value': params.value, 'value_num': parseFloat(params.value) || 0},
      {'event': params.event}
    )
  },
  async triggerCardPost({homey, params}) {
    Util.debugLog('received event triggerCardPost', params)

    const triggerCard = homey.flow.getTriggerCard('http_post');
    return await triggerCard.trigger(
      {'value': 'null', 'value_num': 0},
      {'event': params.event}
    )
  }
}
