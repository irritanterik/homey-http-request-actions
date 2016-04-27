/* global Homey, $, __ */
function onHomeyReady () {
  initSettings()
  Homey.ready()
}

function initSettings () {
  clearBusy()
  clearError()
  clearSuccess()

  Homey.get('httpSettings', function (error, currentHttpSettings) {
    if (error) return console.error(error)
    if (currentHttpSettings != null) {
      $('#apiAuthorization').prop('checked', currentHttpSettings['apiAuthorization'])
    } else {
      $('#apiAuthorization').prop('checked', true)
    }
  })
}

function saveSettings () {
  var currentHttpSettings = {
    apiAuthorization: $('#apiAuthorization').prop('checked')
  }
  $('#saveSettings').prop('disabled', true)
  showBusy(__('settings.messages.busySaving'))
  setTimeout(function () {
    Homey.set('httpSettings', currentHttpSettings, function (error, settings) {
      $('#saveSettings').prop('disabled', false)
      if (error) { return showError(__('settings.messages.errorSaving')) }
      showSuccess(__('settings.messages.successSaving'), 3000)
    })
  }, 2000)
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
