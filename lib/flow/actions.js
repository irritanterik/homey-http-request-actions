const util = require('../util.js')
const http = require('http.min')
const WebSocket = require('ws')

exports.init = function (homey) {
  const betterLogicApp = homey.api.getApiApp('net.i-dev.betterlogic')

  homey.flow.getActionCard('http_delete').registerRunListener(onActionHttpDelete)
  homey.flow.getActionCard('http_get').registerRunListener(onActionHttpGet)
  homey.flow.getActionCard('http_get_json').registerRunListener(onActionHttpGetJson)
  homey.flow.getActionCard('http_get_variable_1').registerRunListener(onActionHttpGetVariable1)
  homey.flow.getActionCard('http_get_variable_BetterLogic').registerRunListener(onActionHttpGetVariableBetterLogic)    
    .getArgument('betterVariable')
    .registerAutocompleteListener(onBetterLogicVariableAutocomplete)
  homey.flow.getActionCard('http_get_full_json').registerRunListener(onActionHttpGetFullJson)
  homey.flow.getActionCard('http_post_form').registerRunListener(onActionHttpPostForm)
  homey.flow.getActionCard('http_post_json').registerRunListener(onActionHttpPostJson)
  homey.flow.getActionCard('http_post_xml').registerRunListener(onActionHttpPostXml)
  homey.flow.getActionCard('http_put_json').registerRunListener(onActionHttpPutJson)
  homey.flow.getActionCard('http_request').registerRunListener(onActionHttpRequest)
  homey.flow.getActionCard('json_evaluate_variable_trigger').registerRunListener(onActionJsonEvaluateVariableTrigger)
  homey.flow.getActionCard('json_evaluate_variable_BetterLogic').registerRunListener(onActionJsonEvaluateVariableBetterLogic)
    .getArgument('betterVariable')
    .registerAutocompleteListener(onBetterLogicVariableAutocomplete)
  homey.flow.getActionCard('web_socket_send').registerRunListener(onActionWebSocketSend)

  async function onActionHttpDelete (args) {
    return util.genericRequestHelper('A10 action.http_delete', 'delete', args, null)
      .then(result => {
        if (result.response.statusCode >= 300) return Promise.reject(result.response.statusCode)
        return Promise.resolve(true)
      })
  }

  async function onActionHttpGet (args) {
    return util.genericRequestHelper('A20 action.http_get', 'get', args, null)
      .then(result => {
        if (result.response.statusCode !== 200) return Promise.reject(result.response.statusCode)
        return Promise.resolve(true)
      })
  }

  async function onActionHttpGetJson (args) {
    return util.genericRequestHelper('A21 action.http_get_json', 'get', args, {query: args.data})
      .then(result => Promise.resolve(result.response.statusCode === 200))
  }

  async function onActionHttpGetVariable1 (args) {
    return util.genericRequestHelper('A23 action.http_get_variable_1', 'get', args, {query: args.data, json: false})
      .then(result => util.resolveJsonPath(result.data, args.path))
      .then(async variable => {
        const triggerCard = homey.flow.getTriggerCard('http_get_variable_2')
        await triggerCard.trigger({value: variable.toString(), value_num: parseFloat(variable)}, {trigger: args.trigger})
      })
  }

  async function onActionHttpGetVariableBetterLogic (args) {
    return util.genericRequestHelper('A22 action.http_get_variable_BetterLogic', 'get', args, {json: false})
    .then(result => util.resolveJsonPath(result.data, args.path))
    .then(variable => {
      variable = fixedEncodeURIComponent(variable).replace(/\//g, '%2F')
      //todo: explicitly test migration from escape to fixedEncodeURIComponent
      util.debugLog('  --> variable result formatted', variable)
      return betterLogicApp.put('/' + args.betterVariable.name + '/' + variable, null)
    })
    .then(Promise.resolve(true))  
  }

  async function onActionHttpGetFullJson (args) {
    return util.genericRequestHelper('A24 action.http_get_full_json', 'get', args, {json: false})
    .then(result => util.convertToJson(result.data))
      .then(async json => {
        const triggerCard = homey.flow.getTriggerCard('full_json')
        await triggerCard.trigger({json: JSON.stringify(json)}, {trigger: args.trigger})
      })
  }

  async function onActionHttpPostForm (args) {
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

  async function onActionHttpPostJson (args) {
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

  async function onActionHttpPostXml (args) {
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

  async function onActionHttpPutJson (args) {
    return util.genericRequestHelper('A40 action.http_put_json', 'put', args, {json: args.data})
      .then(result => {
        if (result.response.statusCode === 200) return Promise.resolve(true)
        return Promise.reject(result.response.statusCode)
      })
  }

  async function onActionHttpRequest (args) {
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

  async function onActionJsonEvaluateVariableTrigger (args) {
    util.debugLog('A81 flow action.json_evaluate_variable_trigger', {args: args})
    return util.resolveJsonPath(args.droptoken, args.path)
      .then(async variable => {
        util.debugLog('  --> variable result', variable)
        
        const triggerCard = homey.flow.getTriggerCard('http_get_variable_2')
        await triggerCard.trigger({value: variable.toString(), value_num: parseFloat(variable)}, {trigger: args.trigger})
      })
  }

  async function onActionJsonEvaluateVariableBetterLogic (args) {
    return util.resolveJsonPath(args.droptoken, args.path)
      .then(variable => {
        variable = fixedEncodeURIComponent(variable).replace(/\//g, '%2F')
        util.debugLog('  --> variable result formatted', variable)
        return betterLogicApp.put('/' + args.betterVariable.name + '/' + variable, null)
      })
      .then(Promise.resolve(true))
  }

  async function onActionWebSocketSend (args) {
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

  async function onBetterLogicVariableAutocomplete (value) {
    util.debugLog('betterVariable.autocomplete', {value: value})
    if (!await betterLogicApp.getInstalled()) return []
    return betterLogicApp
      .get('/ALL')
      .then(result => result.filter(variable => variable.name.toLowerCase().includes(value.toLowerCase())))
  }

  // function filterSupportedVariables (partialWord) {
  //   return function (element) {
  //     return element.name.toLowerCase().indexOf(partialWord.toLowerCase()) > -1 && (element.type === 'string' || element.type === 'number')
  //   } // todo, example;         variable.name.toLowerCase().includes(value.toLowerCase()) && ['string', 'number'].includes(element.type)
  // }


}