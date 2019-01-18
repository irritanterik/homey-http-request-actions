const Homey = require('homey')
const util = require('../util.js')

exports.init = function () {
  Homey.app.conditionHttpGet = new Homey.FlowCardCondition('http_get')
    .registerRunListener(onConditionHttpGet)
    .register()

  Homey.app.conditionHttpGetJson = new Homey.FlowCardCondition('http_get_json')
    .registerRunListener(onConditionHttpGetJson)
    .register()

  Homey.app.conditionHttpGetVariable = new Homey.FlowCardCondition('http_get_variable')
    .registerRunListener(onConditionHttpGetVariable)
    .register()

  Homey.app.conditionJsonEvaluate = new Homey.FlowCardCondition('json_evaluate')
    .registerRunListener(onConditionJsonEvaluate)
    .register()
}

  // Get request Response flow condition
function onConditionHttpGet (args) {
  return util.genericRequestHelper('C20 condition.http_get', 'get', args, null)
    .then(result => Promise.resolve(result.response.statusCode === args.status_code))
}

  // Get request Response (JSON) flow condition
function onConditionHttpGetJson (args) {
  return Promise.resolve(JSON.parse(args.data))
    .then(data => util.genericRequestHelper('C21 condition.http_get_json', 'get', args, {query: data}))
    .then(result => Promise.resolve(result.response.statusCode === args.status_code))
}

function onConditionHttpGetVariable (args) {
  return Promise.resolve(JSON.parse(args.data))
    .then(data => util.genericRequestHelper('C22 condition.http_get_variable', 'get', args, {query: data, json: false}))
    .then(result => util.resolveJsonPath(result.data, args.path))
    .then(variable => Promise.resolve(variable.toString() === args.condition.toString()))
}

function onConditionJsonEvaluate (args) {
  return util
    .resolveJsonPath(args.droptoken, args.path)
    .then(variable => Promise.resolve(variable.toString() === args.condition.toString()))
}
