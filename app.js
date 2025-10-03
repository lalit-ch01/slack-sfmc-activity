// Route: execute Slack message
app.post('/execute', async (req, res) => {
  try {
    console.log('Incoming execute body:', JSON.stringify(req.body, null, 2));

    // Safely extract inArguments
    const inArgs = (req.body && req.body.inArguments && req.body.inArguments[0]) || {};
    const channel = inArgs.channel;
    const message = inArgs.slackMessage;

    if (!channel || !message) {
      console.error('Missing channel or message in inArguments:', inArgs);
      return res.status(400).send('Invalid inArguments: channel or slackMessage missing');
    }

    console.log('Sending to channel:', channel, 'message:', message);

    await axios.post(
      'https://slack.com/api/chat.postMessage',
      { channel: channel, text: message },
      {
        headers: {
          "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).send('Message sent to Slack');
  } catch (err) {
    console.error('Slack API error:', err.response ? err.response.data : err.message);
    res.status(500).send('Error sending Slack message');
  }
});
