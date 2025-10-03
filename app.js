// app.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();   // ✅ must be defined before any app.use/app.post
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

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

// Dummy routes for Journey Builder lifecycle
app.post('/save', (req, res) => res.sendStatus(200));
app.post('/publish', (req, res) => res.sendStatus(200));
app.post('/validate', (req, res) => res.sendStatus(200));
app.post('/stop', (req, res) => res.sendStatus(200));

// Start server
app.listen(PORT, () => {
  console.log(`Slack custom activity running on port ${PORT}`);
});
