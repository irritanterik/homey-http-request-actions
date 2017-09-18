const Homey = require('homey')
const util = require('../util.js')

const http = require('http.min')
const WebSocket = require('ws')

let betterLogic = new Homey.ApiApp('net.i-dev.betterlogic')

exports.init = function () {
  let actionHttpDelete = new Homey.FlowCardAction('http_delete')
  actionHttpDelete.register().registerRunListener(onActionHttpDelete)

  let actionHttpGet = new Homey.FlowCardAction('http_get')
  actionHttpGet.register().registerRunListener(onActionHttpGet)

  let actionHttpGetJson = new Homey.FlowCardAction('http_get_json')
  actionHttpGetJson.register().registerRunListener(onActionHttpGetJson)

  let actionHttpGetVariable1 = new Homey.FlowCardAction('http_get_variable_1')
  actionHttpGetVariable1.register().registerRunListener(onActionHttpGetVariable1)

  let actionHttpGetFullJson = new Homey.FlowCardAction('http_get_full_json')
  actionHttpGetFullJson.register().registerRunListener(onActionHttpGetFullJson)

  let actionHttpGetVariableBetterLogic = new Homey.FlowCardAction('http_get_variable_BetterLogic')
  actionHttpGetVariableBetterLogic.register().registerRunListener(onActionHttpGetVariableBetterLogic)

  let argHttpGetVariableBetterLogic_betterVarable = actionHttpGetVariableBetterLogic.getArgument('betterVariable')
  argHttpGetVariableBetterLogic_betterVarable.registerAutocompleteListener(onBetterLogicVariableAutocomplete)

  let actionHttpPostForm = new Homey.FlowCardAction('http_post_form')
  actionHttpPostForm.register().registerRunListener(onActionHttpPostForm)

  let actionHttpPostJson = new Homey.FlowCardAction('http_post_json')
  actionHttpPostJson.register().registerRunListener(onActionHttpPostJson)

  let actionHttpPostXml = new Homey.FlowCardAction('http_post_xml')
  actionHttpPostXml.register().registerRunListener(onActionHttpPostXml)

  let actionHttpPutJson = new Homey.FlowCardAction('http_put_json')
  actionHttpPutJson.register().registerRunListener(onActionHttpPutJson)

  let actionHttpRequest = new Homey.FlowCardAction('http_request')
  actionHttpRequest.register().registerRunListener(onActionHttpRequest)

  let actionJsonEvaluateVariableBetterLogic = new Homey.FlowCardAction('json_evaluate_variable_BetterLogic')
  actionJsonEvaluateVariableBetterLogic.register().registerRunListener(onActionJsonEvaluateVariableBetterLogic)

  let argJsonEvaluateVariableBetterLogic_betterVarable = actionJsonEvaluateVariableBetterLogic.getArgument('betterVariable')
  argJsonEvaluateVariableBetterLogic_betterVarable.registerAutocompleteListener(onBetterLogicVariableAutocomplete)

  let actionJsonEvaluateVariableTrigger = new Homey.FlowCardAction('json_evaluate_variable_trigger')
  actionJsonEvaluateVariableTrigger.register().registerRunListener(onActionJsonEvaluateVariableTrigger)

  let actionWebSocketSend = new Homey.FlowCardAction('web_socket_send')
  actionWebSocketSend.register().registerRunListener(onActionWebSocketSend)
}

function onActionHttpDelete (args) {
  return util.genericRequestHelper('A10 action.http_delete', 'delete', args, null)
    .then(result => {
      if (result.response.statusCode !== 200) return Promise.reject(result.response.statusCode)
      return Promise.resolve(true)
    })
}

function onActionHttpGet (args) {
  return util.genericRequestHelper('A20 action.http_get', 'get', args, null)
    .then(result => {
      if (result.response.statusCode !== 200) return Promise.reject(result.response.statusCode)
      return Promise.resolve(true)
    })
}

function onActionHttpGetJson (args) {
  return util.genericRequestHelper('A21 action.http_get_json', 'get', args, {query: args.data})
    .then(result => Promise.resolve(result.response.statusCode === 200))
}

function onActionHttpGetVariable1 (args) {
  return util.genericRequestHelper('A23 action.http_get_variable_1', 'get', args, {query: args.data, json: false})
    .then(result => { return util.resolveJsonPath(result.data, args.path) })
    .then(variable => {
      Homey.ManagerFlow.getCard('trigger', 'http_get_variable_2').trigger({value: variable.toString()}, {trigger: args.trigger})
    })
}

function onActionHttpGetFullJson (args) {
  return util.genericRequestHelper('A24 action.http_get_full_json', 'get', args, {json: false})
    .then(result => { return util.convertToJson(result.data) })
    .then(json => {
      Homey.ManagerFlow.getCard('trigger', 'full_json').trigger({json: JSON.stringify(json)}, {trigger: args.trigger})
    })
}

// HTTP Get JSON or XML request and put in BetterLogic variable flow action
function onActionHttpGetVariableBetterLogic (args) {
  return betterLogic.getInstalled()
    .then(util.genericRequestHelper('A22 action.http_get_variable_BetterLogic', 'get', args, {json: false}))
    .then(result => { return util.resolveJsonPath(result.data, args.path) })
    .then(variable => {
      variable = escape(variable).replace(/\//g, '%2F')
      util.debugLog('  --> variable result formatted', variable)
      return betterLogic.put('/' + args.betterVariable.name + '/' + variable, null)
    })
    .then(Promise.resolve(true))
}

function onBetterLogicVariableAutocomplete (value) {
  util.debugLog('betterVariable.autocomplete', {value: value})
  return betterLogic.getInstalled()
    .get('/ALL')
    .then(result => Promise.resolve(result.filter(filterSupportedVariables(value))))
}

function onActionHttpPostForm (args) {
  return util.genericRequestHelper('A30 action.http_post_form', 'post', args, {form: args.data})
    .then(result => {
      if (result.response.statusCode === 200 ||
          result.response.statusCode === 201 ||
          result.response.statusCode === 202) {
        return Promise.resolve(true)
      }
      return Promise.reject(result.response.statusCode)
    })
}

function onActionHttpPostJson (args) {
  return util.genericRequestHelper('A31 action.http_post_json', 'post', args, {json: args.data})
    .then(result => {
      if (result.response.statusCode === 200 ||
          result.response.statusCode === 201 ||
          result.response.statusCode === 202) {
        return Promise.resolve(true)
      }
      return Promise.reject(result.response.statusCode)
    })
}

function onActionHttpPostXml (args) {
  return util.genericRequestHelper('A32 action.http_post_xml', 'post', args, {headers: {'content-type': 'application/xml'}}, args.data)
    .then(result => {
      if (result.response.statusCode === 200 ||
          result.response.statusCode === 201 ||
          result.response.statusCode === 202) {
        return Promise.resolve(true)
      }
      return Promise.reject(result.response.statusCode)
    })
}

function onActionHttpPutJson (args) {
  return util.genericRequestHelper('A40 action.http_put_json', 'put', args, {json: args.data})
    .then(result => {
      if (result.response.statusCode === 200) return Promise.resolve(true)
      return Promise.reject(result.response.statusCode)
    })
}

function onActionHttpRequest (args) {
  util.debugLog('A90 WARNING: Depricated "HTTP Geek Request" action used. Will be deleted in next version.')
  return Promise.resolve(JSON.parse(args.options))
    .then(options => {
      let method = (options.method || 'get').toLowerCase()
      return http[method](options)
    })
    .then(result => {
      if (result.response.statusCode === 200) return Promise.resolve(true)
      return Promise.reject(result.response.statusCode)
    })
}

function onActionJsonEvaluateVariableBetterLogic (args) {
  return betterLogic.getInstalled()
    .then(util.resolveJsonPath(args.droptoken, args.path))
    .then(variable => {
      variable = escape(variable).replace(/\//g, '%2F')
      util.debugLog('  --> variable result formatted', variable)
      return betterLogic.put('/' + args.betterVariable.name + '/' + variable, null)
    })
    .then(Promise.resolve(true))
}

function onActionJsonEvaluateVariableTrigger (callback, args) {
  return util.resolveJsonPath(args.droptoken, args.path)
    .then(variable => {
      Homey.ManagerFlow.getCard('trigger', 'http_get_variable_2').trigger({value: variable.toString()}, {trigger: args.trigger})
    })
}

function onActionWebSocketSend (callback, args) {
  util.debugLog('A70 flow action.web_socket_send', {args: args})
  let url = args.url
  let data = args.data
  try {
    var ws = new WebSocket(url)
  } catch (error) {
    return Promise.reject(error)
  }
  ws.on('open', function () {
    ws.send(data, function () {
      ws.close()
      util.debugLog('  --> webSocket Send action completed')
      return Promise.resolve(true)
    })
  }).on('error', function (error) {
    util.debugLog('  --> webSocket Send action failed', error)
    return Promise.reject(error)
  })
}

function filterSupportedVariables (partialWord) {
  return function (element) {
    return element.name.toLowerCase().indexOf(partialWord.query.toLowerCase()) > -1 && (element.type === 'string' || element.type === 'number')
  }
}
