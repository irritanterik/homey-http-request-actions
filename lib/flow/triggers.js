exports.init = function (homey) {

  const triggerHttpGet = homey.flow.getTriggerCard('http_get')
  triggerHttpGet.registerRunListener(async (args, state) => {
      console.log('homey.flow.getTriggerCard(http_get)', {args, state})
      return args.event.toLowerCase() === state.event.toLowerCase()
  })

  const triggerHttpGetVariable2 = homey.flow.getTriggerCard('http_get_variable_2')
  triggerHttpGetVariable2.registerRunListener(async (args, state) => {
      console.log('homey.flow.getTriggerCard(triggerHttpGetVariable2)', {args, state})
      return args.trigger.toLowerCase() === state.trigger.toLowerCase()
  })

  const triggerFullJson = homey.flow.getTriggerCard('full_json')
  triggerFullJson.registerRunListener(async (args, state) => {
      console.log('homey.flow.getTriggerCard(triggerFullJson)', {args, state})
      return args.trigger.toLowerCase() === state.trigger.toLowerCase()  
      // todo: shouldn't this check jsonpath?
  })

  const triggerHttpPostVariable = homey.flow.getTriggerCard('http_post_variable')
  triggerHttpPostVariable.registerRunListener(async (args, state) => {
      console.log('homey.flow.getTriggerCard(triggerHttpPostVariable)', {args, state})
      return args.event.toLowerCase() === state.event.toLowerCase()
  })
}
