const Homey = require('homey')
// const util = require('../util.js')

exports.init = function () {
  let triggerHttpGet = new Homey.FlowCardTrigger('http_get')
  triggerHttpGet
    .register()
    .registerRunListener((args, state) => Promise.resolve(args.event.toLowerCase() === state.event.toLowerCase()))

  let triggerHttpGetVariable2 = new Homey.FlowCardTrigger('http_get_variable_2')
  triggerHttpGetVariable2
    .register()
    .registerRunListener((args, state) => Promise.resolve(args.trigger.toLowerCase() === state.trigger.toLowerCase()))

  let triggerFullJson = new Homey.FlowCardTrigger('full_json')
  triggerFullJson
    .register()
    .registerRunListener((args, state) => Promise.resolve(args.trigger.toLowerCase() === state.trigger.toLowerCase()))

  let triggerHttpPostVariable = new Homey.FlowCardTrigger('http_post_variable')
  triggerHttpPostVariable
    .register()
    .registerRunListener((args, state) => Promise.resolve(args.event.toLowerCase() === state.event.toLowerCase()))
}
