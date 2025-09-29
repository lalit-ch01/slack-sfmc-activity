// app.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Route: fetch Slack channels
app.get('/channels', async (req, res) => {
  try {
    const response = await axios.get('https://slack.com/api/conversations.list', {
      headers: {
        "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}`
      }
    });

    if (response.data.ok) {
      const channels = response.data.channels.map(ch => ({
        id: ch.id,
        name: ch.name
      }));
      res.json(channels);
    } else {
      res.status(500).json({ error: response.data.error });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching channels');
  }
});

// Route: execute Slack message
app.post('/execute', async (req, res) => {
  try {
    const inArgs = req.body.inArguments[0];
    const channel = inArgs.channel;
    const message = inArgs.slackMessage;

    await axios.post('https://slack.com/api/chat.postMessage', {
      channel: channel,
      text: message
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    res.status(200).send('Message sent to Slack');
  } catch (err) {
    console.error(err);
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
