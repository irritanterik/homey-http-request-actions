const util = require('../util.js')

exports.init = function (homey) {
  homey.flow.getConditionCard('http_get').registerRunListener(onConditionHttpGet)
  homey.flow.getConditionCard('http_get_json').registerRunListener(onConditionHttpGetJson)
  homey.flow.getConditionCard('http_get_variable').registerRunListener(onConditionHttpGetVariable)
  homey.flow.getConditionCard('json_evaluate').registerRunListener(onConditionJsonEvaluate)
}

  // Get request Response flow condition
async function onConditionHttpGet (args) {
  return util.genericRequestHelper('C20 condition.http_get', 'get', args, null)
    .then(result => result.response.statusCode === args.status_code)
}

  // Get request Response (JSON) flow condition
async function onConditionHttpGetJson (args) {
  return Promise.resolve(JSON.parse(args.data))
    .then(data => util.genericRequestHelper('C21 condition.http_get_json', 'get', args, {query: data}))
    .then(result => result.response.statusCode === args.status_code)
}

async function onConditionHttpGetVariable (args) {
  return Promise.resolve(JSON.parse(args.data))
    .then(data => util.genericRequestHelper('C22 condition.http_get_variable', 'get', args, {query: data, json: false}))
    .then(result => util.resolveJsonPath(result.data, args.path))
    .then(variable => variable.toString() === args.condition.toString())
}

async function onConditionJsonEvaluate (args) {
  return util
    .resolveJsonPath(args.droptoken, args.path)
    .then(variable => variable.toString() === args.condition.toString())
}
