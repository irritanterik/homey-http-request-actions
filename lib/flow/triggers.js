exports.init = function (homey) {
  homey.flow.getTriggerCard('http_get').registerRunListener(onTriggerCompareEvent)
  homey.flow.getTriggerCard('http_get_variable_2').registerRunListener(onTriggerCompareTrigger)
  homey.flow.getTriggerCard('full_json').registerRunListener(onTriggerCompareTrigger)
  homey.flow.getTriggerCard('http_post_variable').registerRunListener(onTriggerCompareEvent)
}

async function onTriggerCompareEvent (args, state) {
  console.log('homey.flow.getTriggerCard(onTriggerCompareEvent)', {args, state})
  return args.event.toLowerCase() === state.event.toLowerCase()
}

async function onTriggerCompareTrigger(args, state) {
  console.log('homey.flow.getTriggerCard(onTriggerCompareTrigger)', {args, state})
  return args.trigger.toLowerCase() === state.trigger.toLowerCase()  
}