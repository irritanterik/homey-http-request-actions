/* global Homey */
var http = require('http.min')

exports.debugLog = function (message, data) {
  var logLine = {datetime: new Date(), message: message}
  if (data) logLine.data = data

  Homey.manager('api').realtime('HTTP Log', logLine)
  Homey.log(this.epochToTimeFormatter(), message, data || '')
}

exports.epochToTimeFormatter = function (epoch) {
  if (epoch == null) epoch = new Date().getTime()
  return (new Date(epoch)).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
}

exports.genericRequestHelper = function (flow, defaultMethod, args, mergeOptions) {
  var self = this
  var method = defaultMethod
  var urlOptions = createUrlOptions(args.url, mergeOptions)
  if (urlOptions.method) method = urlOptions.method.toLowerCase()
  self.debugLog(flow, {args: args, method: method, urlOptions: urlOptions})
  return http[method](urlOptions)
} // function genericRequestHelper

exports.isArray = function (a) { return (!!a) && (a.constructor === Array) }

exports.isObject = function (a) { return (!!a) && (a.constructor === Object) }

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
  for (var k in src) {
    if (!(k in dest)) dest[k] = src[k]
  }
} // function mergeOptional
