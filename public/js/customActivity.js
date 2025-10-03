'use strict';

// DEFAULT channel fallback (Option 1)
var DEFAULT_SLACK_CHANNEL_ID = 'C09H77827B9';

if (!window.Postmonger) {
  console.error('Postmonger not found. Ensure postmonger.js is loaded before this file.');
}

var connection = new Postmonger.Session();
var payload = {};

$(window).ready(onRender);

connection.on('initActivity', initialize);
connection.on('clickedNext', save);

function onRender() {
  connection.trigger('ready');
  $('#saveBtn').click(save);

  // preserve any UI-specific handlers (if you still have them)
  $('#recipientTypeSelect').on('change', function () {
    var val = $(this).val();
    if (val === 'channel') {
      $('#idLabel').text('Slack Channel ID:');
      $('#idInput').attr('placeholder', 'e.g. C01ABC123');
    } else {
      $('#idLabel').text('Slack User ID:');
      $('#idInput').attr('placeholder', 'e.g. U01DEF456');
    }
  });
}

function initialize(data) {
  if (data) {
    payload = data;
  }

  var inArgs = (payload.arguments && payload.arguments.execute && payload.arguments.execute.inArguments) || [];
  if (inArgs.length > 0) {
    var arg = inArgs[0];
    // populate message input only (we don't have channel input UI in this option)
    $('#messageInput').val(arg.slackMessage || '');

    // if a channel was already present in saved payload, leave it as-is (we won't override here)
    if (arg.channel) {
      console.log('init: existing channel found in payload:', arg.channel);
    } else {
      console.log('init: no channel present in payload');
    }
  } else {
    console.log('init: no inArguments present yet');
  }
}

function save() {
  var message = $('#messageInput').val().trim();

  if (!message) {
    alert('Please enter a message.');
    return;
  }

  // Ensure nested structure exists
  payload.arguments = payload.arguments || {};
  payload.arguments.execute = payload.arguments.execute || {};
  payload.arguments.execute.inArguments = payload.arguments.execute.inArguments || [{}];

  // Preserve existing channel if present, otherwise set default
  var existingChannel = payload.arguments.execute.inArguments[0].channel;
  if (existingChannel && String(existingChannel).trim().length > 0) {
    // keep existing
    console.log('save: preserving existing channel:', existingChannel);
    payload.arguments.execute.inArguments[0].channel = existingChannel;
  } else {
    // set default channel (Option 1)
    payload.arguments.execute.inArguments[0].channel = DEFAULT_SLACK_CHANNEL_ID;
    console.log('save: no existing channel found — using DEFAULT_SLACK_CHANNEL_ID:', DEFAULT_SLACK_CHANNEL_ID);
  }

  // update message
  payload.arguments.execute.inArguments[0].slackMessage = message;

  payload.metaData = payload.metaData || {};
  payload.metaData.isConfigured = true;

  console.log('save: payload to updateActivity:', JSON.stringify(payload.arguments.execute.inArguments[0]));
  connection.trigger('updateActivity', payload);
}
