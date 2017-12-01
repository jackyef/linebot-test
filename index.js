'use strict';

const dictionary = require('./dictionary');
const line = require('@line/bot-sdk');
const express = require('express');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  const responses = dictionary.responses;
  const keywords = dictionary.keywords;
  const receivedWords = event.message.text.split(' ');
  console.log("received", receivedWords)
  const responsesArrays = receivedWords.map( keyword => {
    keyword = keyword.toLowerCase();
    if(responses[keywords[keyword]] !== undefined) return responses[keywords[keyword]];
  });

  const possibleResponses = [].concat.apply([], responsesArrays);
  console.log("possible:", possibleResponses);

  const randomIndex = getRandomInt(0, possibleResponses.length);
  
  const replyToBeSent = { type: 'text', text: possibleResponses[randomIndex] };
  // use reply API
  return client.replyMessage(event.replyToken, replyToBeSent);

}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
