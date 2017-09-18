const Homey = require('homey')
const http = require('http.min')
const jsonPath = require('jsonpath-plus')
const parseString = require('xml2js').parseString

exports.convertToJson = function (data) {
  if (!this.isObject(data)) {
    try {
      data = JSON.parse(data)
    } catch (e) {
      this.debugLog('  --> data is invalid JSON, will try XML now')
      parseString(data, (error, xml2jsResult) => {
        if (error) {
          this.debugLog('  --> data is invalid XML')
          return Promise.reject('Invalid json or xml data')
        }
        data = xml2jsResult
      })
    }
  }
  return Promise.resolve(data)
}

exports.debugLog = function (message, data) {
  var logLine = {datetime: new Date(), message: message}
  if (data) logLine.data = data

  Homey.ManagerApi.realtime('HTTP Log', logLine)
  console.log(this.epochToTimeFormatter(), message, data || '')
}

exports.epochToTimeFormatter = function (epoch) {
  if (epoch == null) epoch = new Date().getTime()
  return (new Date(epoch)).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
}

exports.genericRequestHelper = function (flow, defaultMethod, args, mergeOptions, data) {
  var self = this
  var method = defaultMethod
  if (mergeOptions) {
    Object.keys(mergeOptions).filter(key => (['json', 'data', 'form', 'query'].indexOf(key) !== -1)).forEach(key => {
      if (!self.isObject(mergeOptions[key])) {
        try { mergeOptions[key] = JSON.parse(mergeOptions[key]) } catch (error) { return Promise.reject(error) }
      }
    })
  }
  var urlOptions = createUrlOptions(args.url, mergeOptions)
  if (urlOptions.method) method = urlOptions.method.toLowerCase()
  self.debugLog(flow, {args: args, method: method, urlOptions: urlOptions})
  return http[method](urlOptions, data).then(result => {
    self.debugLog(flow, {status: result.response.statusCode, response: result.data})
    return Promise.resolve(result)
  })
} // function genericRequestHelper

exports.resolveJsonPath = function (data, path) {
  return this.convertToJson(data).then(data => {
    this.debugLog('  --> data:', data)
    this.debugLog('  --> jsonPath:', path)
    var variable = jsonPath({json: data, path: path, wrap: false})
    var variableType = this.type(variable)
    this.debugLog('  --> result', {variable: variable, type: variableType})
    if (variableType === 'undefined') return Promise.reject('Value not found')
    if (['object', 'array', 'null'].indexOf(variableType) !== -1) {
      this.debugLog('  --> error: result is an ' + this.type(variable))
      return Promise.reject('Result from jsonPath has type ' + this.type(variable))
    }
    return Promise.resolve(variable)
  })
}

exports.isArray = function (a) { return this.type(a) === 'array' }
exports.isObject = function (a) { return this.type(a) === 'object' }
exports.type = function (a) {
  if (a === null) return 'null'
  if (a === undefined) return 'undefined'
  return a.constructor.name.toLowerCase()
}

function createUrlOptions (input, mergeOptions) {
  // check for json options vs url
  var result
  try {
    result = JSON.parse(input)
  } catch (e) {
    result = {uri: input}
  }
  if (mergeOptions) mergeOptional(result, mergeOptions)
  mergeOptional(result, {timeout: 30000})
  return result
} // function createUrlOptions

function mergeOptional (dest, src) {
  var self = this
  try {
    for (var k in src) {
      if (!(k in dest)) dest[k] = src[k]
    }
  } catch (e) {
    self.debugLog('Something went wrong merging url options', {source: src, destination: dest})
  }
} // function mergeOptional
