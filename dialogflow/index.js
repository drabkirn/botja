"use strict";

// Loading the ENV files as they are secret
require('dotenv').config({ path: '.env' });
if(process.env.APP_ENVIRONMENT == "production") require('dotenv').config({ path: '.env_production' });

// Application Insights Init
let appInsights = require('applicationinsights');
appInsights.setup(process.env.APP_INSIGHTS_INSTRUMENTATION_KEY).start();
let appInsightsClient = appInsights.defaultClient;
appInsightsClient.config.maxBatchIntervalMs = 0;

let appInsightsStartServerTime = Date.now();

// Initialize Express and DialogFlow
const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');

// Setup Express
const app = express();
app.use(express.json());

// Modules Setup
let welcomeModule = require("./intents/welcome");
let fallbackModule = require("./intents/fallback");
let helpModule = require("./intents/help");
let aboutmeModule = require("./intents/aboutme");
let jokeModule = require("./intents/joke");
let quoteModule = require("./intents/quote");
let movieModule = require("./intents/movie");
let weatherModule = require("./intents/weather");


app.post('/api/dialogflow', (req, res) => {
  let agent = new WebhookClient({request: req, response: res});
  let intentMap = new Map();
  let isAccessTokenCorrect = true;

  // Check for access token, if not return with error.
  if(!req.headers || !req.headers['x-access-token'] || req.headers['x-access-token'] !== process.env.DIALOGFLOW_ACCESS_TOKEN) {
    isAccessTokenCorrect = false;
    appInsightsClient.trackTrace({
      message: "Access Token Error - Check on Dialogflow Portal",
      severity: 3,
      properties: { name: "botja-dialogflow", invocation: "Start", err: "access token" }
    });

    agent.add("Exception: Access error. Sorry, there's something wrong from our end, If the problem persists, please contact us at drabkirn@cdadityang.xyz");
  }

  intentMap.set('WelcomeIntent', async (agent) => {
    if(!isAccessTokenCorrect) return;
    await welcomeModule.welcomeCommand(agent, appInsightsClient);
  });

  intentMap.set('FallbackIntent', async (agent) => {
    if(!isAccessTokenCorrect) return;
    await fallbackModule.fallbackCommand(agent, appInsightsClient);
  });

  intentMap.set('HelpIntent', async (agent) => {
    if(!isAccessTokenCorrect) return;
    await helpModule.helpCommand(agent, appInsightsClient);
  });

  intentMap.set('AboutmeIntent', async (agent) => {
    if(!isAccessTokenCorrect) return;
    await aboutmeModule.aboutmeCommand(agent, appInsightsClient);
  });

  intentMap.set('JokeIntent', async (agent) => {
    if(!isAccessTokenCorrect) return;
    await jokeModule.jokeCommand(agent, appInsightsClient);
  });

  intentMap.set('QuoteIntent', async (agent) => {
    if(!isAccessTokenCorrect) return;
    await quoteModule.quoteCommand(agent, appInsightsClient);
  });

  intentMap.set('MovieIntent', async (agent) => {
    if(!isAccessTokenCorrect) return;
    await movieModule.movieCommand(agent, appInsightsClient);
  });

  intentMap.set('WeatherIntent', async (agent) => {
    if(!isAccessTokenCorrect) return;
    await weatherModule.weatherCommand(agent, appInsightsClient);
  });

  agent.handleRequest(intentMap);
});

// Express Spin up
const serverPort = process.env.DIALOGFLOW_PORT || 8001;
app.listen(serverPort, function() {
  let appInsightsStartServerDuration = Date.now() - appInsightsStartServerTime;
  appInsightsClient.trackMetric({name: "botja-dialogflow-start-time", value: appInsightsStartServerDuration});

  console.log(`Server up and listening on Port: ${ serverPort }`);
});