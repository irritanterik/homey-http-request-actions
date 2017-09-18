
/* global $, __ */
var whitelist = []
var HomeyObj

function onHomeyReady (Homey) {
  HomeyObj = Homey
  initSettings()
  HomeyObj.ready()
}

function initSettings () {
  clearBusy()
  clearError()
  clearSuccess()
  $('#template').hide()
  $('#newIp').change(function () {
    typeIp()
  })
  $('#apiAuthorization').change(function () {
    saveApiAuthorization()
  })
  $('#addIp').click(function () {
    addIp()
  })
  loadSettings()
}

function typeIp () {
  var typed = $('#newIp').val()
  $('#newIp').val(typed.split('.').map(Number).join('.').replace(/NaN/g, '0'))
}

function addIp () {
  var typed = $('#newIp').val()
  var matched = typed.match(/^(([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)\.){3}([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)$/g)
  if (!matched) return showError(__('settings.messages.errorIpInvalid'), 3000)
  var ip = matched[0]
  if (whitelist.indexOf(ip) !== -1) return showError(__('settings.messages.errorIpDuplicate'), 3000)
  $('#newIp').val('')
  $(`[data-ip]`).remove()
  whitelist.push(ip)
  whitelist.sort(sortIp).forEach(addIpEntry)
  saveWhitelist()
  showSuccess(__('settings.messages.successSaving'), 1500)
}

function sortIp (a, b) {
  return a.split('.').map(x => ('000' + x).slice(-3)).join() <
    b.split('.').map(x => ('000' + x).slice(-3)).join() ? -1 : 1
}

function addIpEntry (ip) {
  var newRow = $('#template').clone()
  newRow.attr('data-ip', ip)
  newRow.find('.code').html(ip)
  newRow.find('[data="del_btn"]').attr('onClick', `delIp('${ip}')`)
  newRow.insertBefore('#newIpRow').show()
}

function delIp (ip) {
  $(`[data-ip="${ip}"]`).remove()
  var delIndex = whitelist.indexOf(ip)
  whitelist.splice(delIndex, 1)
  saveWhitelist()
}

function loadSettings () {
  HomeyObj.get('httpSettings', function (error, currentHttpSettings) {
    if (error) return console.error(error)
    if (currentHttpSettings != null) {
      $('#apiAuthorization').prop('checked', currentHttpSettings['apiAuthorization'])
    } else {
      $('#apiAuthorization').prop('checked', true)
    }
  })

  HomeyObj.get('httpWhitelist', function (error, currentWhitelist) {
    if (error) return console.error(error)
    whitelist = currentWhitelist || []
    whitelist.sort(sortIp).forEach(addIpEntry)
  })
}

function saveWhitelist () {
  HomeyObj.set('httpWhitelist', whitelist, function (error, settings) {
    if (error) { return showError(__('settings.messages.errorSaving')) }
    showSuccess(__('settings.messages.successSaving'), 3000)
  })
}

function saveApiAuthorization () {
  var currentHttpSettings = {
    apiAuthorization: $('#apiAuthorization').prop('checked')
  }
  HomeyObj.set('httpSettings', currentHttpSettings, function (error, settings) {
    if (error) { return showError(__('settings.messages.errorSaving')) }
    showSuccess(__('settings.messages.successSavingRestart'), 5000)
  })
}

function clearBusy () { $('#busy').hide() }
function showBusy (message, showTime) {
  clearError()
  clearSuccess()
  $('#busy span').html(message)
  $('#busy').show()
  if (showTime) $('#busy').delay(showTime).fadeOut()
}

function clearError () { $('#error').hide() }
function showError (message, showTime) {
  clearBusy()
  clearSuccess()
  $('#error span').html(message)
  $('#error').show()
  if (showTime) $('#error').delay(showTime).fadeOut()
}

function clearSuccess () { $('#success').hide() }
function showSuccess (message, showTime) {
  clearBusy()
  clearError()
  $('#success span').html(message)
  $('#success').show()
  if (showTime) $('#success').delay(showTime).fadeOut()
}
