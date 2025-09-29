define(['jquery', 'postmonger'], function($, Postmonger) {
  'use strict';

  var connection = new Postmonger.Session();
  var payload = {};

  $(window).ready(onRender);

  connection.on('initActivity', initialize);
  connection.on('clickedNext', save);

  function onRender() {
    connection.trigger('ready');
    $('#saveBtn').click(save);

    // No channel dropdown fetch needed anymore
  }

  function initialize(data) {
    if (data) {
      payload = data;
    }

    var inArgs = payload.arguments && payload.arguments.execute && payload.arguments.execute.inArguments || [];
    if (inArgs.length > 0) {
      var arg = inArgs[0];
      // Determine recipient type by presence of channel or userId
      if (arg.channel && arg.channel.startsWith('C')) {
        $('#recipientTypeSelect').val('channel');
        $('#idLabel').text('Slack Channel ID:');
        $('#idInput').val(arg.channel);
        $('#idInput').attr('placeholder', 'e.g. C01ABC123');
      } else if (arg.channel && arg.channel.startsWith('U')) {
        // Assuming user IDs start with U
        $('#recipientTypeSelect').val('user');
        $('#idLabel').text('Slack User ID:');
        $('#idInput').val(arg.channel);
        $('#idInput').attr('placeholder', 'e.g. U01DEF456');
      } else {
        // Default fallback
        $('#recipientTypeSelect').val('channel');
        $('#idLabel').text('Slack Channel ID:');
        $('#idInput').val('');
        $('#idInput').attr('placeholder', 'e.g. C01ABC123');
      }

      $('#messageInput').val(arg.slackMessage || '');
    }
  }

  function save() {
    var recipientType = $('#recipientTypeSelect').val();
    var idValue = $('#idInput').val().trim();
    var message = $('#messageInput').val().trim();

    if (!idValue) {
      alert(`Please enter a Slack ${recipientType === 'channel' ? 'channel' : 'user'} ID.`);
      return;
    }
    if (!message) {
      alert('Please enter a message.');
      return;
    }

    // Set the channel/user ID in the "channel" argument for backward compatibility
    payload.arguments.execute.inArguments = [{
      channel: idValue,
      slackMessage: message
    }];

    payload.metaData.isConfigured = true;
    connection.trigger('updateActivity', payload);
  }
});
