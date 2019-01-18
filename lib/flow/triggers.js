const Homey = require('homey')

exports.init = function () {
  Homey.app.triggerHttpGet = new Homey.FlowCardTrigger('http_get')
    .registerRunListener((args, state) => Promise.resolve(args.event.toLowerCase() === state.event.toLowerCase()))
    .register()

  Homey.app.triggerHttpGetVariable2 = new Homey.FlowCardTrigger('http_get_variable_2')
    .registerRunListener((args, state) => Promise.resolve(args.trigger.toLowerCase() === state.trigger.toLowerCase()))
    .register()

  Homey.app.triggerFullJson = new Homey.FlowCardTrigger('full_json')
    .registerRunListener((args, state) => Promise.resolve(args.trigger.toLowerCase() === state.trigger.toLowerCase()))
    .register()

  Homey.app.triggerHttpPostVariable = new Homey.FlowCardTrigger('http_post_variable')
    .registerRunListener((args, state) => Promise.resolve(args.event.toLowerCase() === state.event.toLowerCase()))
    .register()
}
