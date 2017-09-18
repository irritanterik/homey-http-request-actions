const Homey = require('homey')
const util = require('../util.js')

exports.init = function () {
  let conditionHttpGet = new Homey.FlowCardCondition('http_get')
  conditionHttpGet.register().registerRunListener(onConditionHttpGet)

  let conditionHttpGetJson = new Homey.FlowCardCondition('http_get_json')
  conditionHttpGetJson.register().registerRunListener(onConditionHttpGetJson)

  let conditionHttpGetVariable = new Homey.FlowCardCondition('http_get_variable')
  conditionHttpGetVariable.register().registerRunListener(onConditionHttpGetVariable)

  let conditionJsonEvaluate = new Homey.FlowCardCondition('json_evaluate')
  conditionJsonEvaluate.register().registerRunListener(onConditionJsonEvaluate)
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
