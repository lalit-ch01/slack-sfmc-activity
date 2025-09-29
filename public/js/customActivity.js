define(['jquery', 'postmonger'], function($, Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);

    // Called when Journey Builder opens the activity
    function onRender() {
        connection.trigger('ready');
        $('#saveBtn').click(save);

        // Fetch Slack channels from backend
        $.get('/channels', function(channels) {
            var $dropdown = $('#channelDropdown');
            $dropdown.empty();
            if(channels.length === 0) {
                $dropdown.append('<option value="">No channels found</option>');
            } else {
                $dropdown.append('<option value="">--Select Channel--</option>');
                channels.forEach(function(ch) {
                    $dropdown.append(`<option value="${ch.id}">${ch.name}</option>`);
                });
            }
        }).fail(function() {
            alert('Failed to fetch Slack channels. Check server.');
        });
    }

    // Initialize with existing data
    function initialize(data) {
        if (data) {
            payload = data;
        }
        var inArgs = payload.arguments && payload.arguments.execute && payload.arguments.execute.inArguments || [];
        if (inArgs.length > 0) {
            $('#channelDropdown').val(inArgs[0].channel);
            $('#messageInput').val(inArgs[0].slackMessage);
        }
    }

    // Save data and send to Journey Builder
    function save() {
        var selectedChannel = $('#channelDropdown').val();
        var message = $('#messageInput').val();

        if (!selectedChannel || !message) {
            alert('Please select a Slack channel and enter a message.');
            return;
        }

        payload.arguments.execute.inArguments = [{
            "channel": selectedChannel,
            "slackMessage": message
        }];

        payload.metaData.isConfigured = true;
        connection.trigger('updateActivity', payload);
    }
});
