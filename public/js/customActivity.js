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
    // Only populate message input, no channel or recipient type UI
    $('#messageInput').val(arg.slackMessage || '');
  }
}

function save() {
  var message = $('#messageInput').val().trim();

  if (!message) {
    alert('Please enter a message.');
    return;
  }

  // Update only slackMessage in inArguments, keep channel from DE
  var inArgs = payload.arguments.execute.inArguments || [{}];
  inArgs[0].slackMessage = message;

  payload.arguments.execute.inArguments = inArgs;

  payload.metaData.isConfigured = true;
  connection.trigger('updateActivity', payload);
}
