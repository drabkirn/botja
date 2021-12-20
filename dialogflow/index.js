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



// Skype
app.post('/api/dialogflow/botframework', (req, res) => {
  // Import Libs and Files
  const { ActivityTypes,CardFactory, MessageFactory, BotFrameworkAdapter } = require('botbuilder');
  const protoToJson = require('./botlib/proto_to_json.js');
  const dialgoflowSessionClient = require('./botlib/dialogflow_session_client.js');
  const filterResponses = require('./botlib/filter_responses.js');

  // Init Project
  const projectId = process.env.DIALOGFLOW_PROJECT_ID;
  const appId = process.env.MICROSOFT_APP_ID;
  const appPassword = process.env.MICROSOFT_APP_PASSWORD;

  const sessionClient = new dialgoflowSessionClient(projectId);

  // Create bot adapter, which defines how the bot sends and receives messages.
  let adapter = new BotFrameworkAdapter({
    appId: appId,
    appPassword: appPassword
  });

  adapter.processActivity(req, res, async (turnContext) => {
    if (isMessage(turnContext)) {
      const utterance = getMessageText(turnContext);
      const senderId = turnContext.activity.from.id;
      const payload = turnContext.activity;
      const responses = (await sessionClient.detectIntent(
          utterance, senderId, payload)).fulfillmentMessages;
      const replies = await convertToSkypeMessage(turnContext, responses);
      await turnContext.sendActivities(replies);
    } else if(isMemberAdded(turnContext)) {
      for (let idx in turnContext.activity.membersAdded) {
        if (turnContext.activity.membersAdded[idx].id !==
            turnContext.activity.recipient.id) {
          const result = await sessionClient.detectIntentWithEvent('SKYPE_WELCOME',
              projectId);
          const replies = await convertToSkypeMessage(turnContext,
              result.fulfillmentMessages);
          await turnContext.sendActivity(replies);
        }
      }
    }
  });

  function turnContextType(turnContext) {
    return turnContext.activity.type;
  }

  function isMessage(turnContext){
    return turnContextType(turnContext) === 'message';
  }

  function getMessageText(turnContext) {
    return turnContext.activity.text;
  }

  function isMemberAdded(turnContext){
    return Array.isArray(turnContext.activity.membersAdded);
  }

  async function convertToSkypeMessage(turnContext, responses){
    const replies = [];
    if (Array.isArray(responses)) {
      const filteredResponses = await filterResponses.filterResponses(responses, 'SKYPE');
      filteredResponses.forEach((response)=> {
        let reply = {type: ActivityTypes.Message};
        switch (response.message) {
          case 'text': {
            reply.text = response.text.text[0];
          }
            break;

          case 'image': {
            reply.attachments = [(CardFactory.heroCard(
                '',
                CardFactory.images([response.image.imageUri])
            ))];
          }
            break;

          case 'card': {
            const buttons = response.card.buttons;
            let skypeButtons = [];
            if (Array.isArray(buttons) && buttons.length > 0) {
              buttons.forEach((button) => {
                if (button.postback.startsWith('http')) {
                  skypeButtons.push({
                    type: 'openUrl',
                    title: button.text,
                    value: button.postback
                  });
                } else {
                  skypeButtons.push({
                    type: 'postBack',
                    title: button.text,
                    value: button.postback
                  });
                }
              });
              reply.attachments = [(CardFactory.heroCard(
                  response.card.title,
                  response.card.subtitle,
                  CardFactory.images([response.card.imageUri]),
                  skypeButtons))];
            }
          }
            break;

          case 'quickReplies': {
            reply = MessageFactory.suggestedActions(
                response.quickReplies.quickReplies, response.quickReplies.title);
          }
            break;

          case 'payload': {
            const protoPayload = response.payload.fields.skype.structValue;
            reply = protoToJson.structProtoToJson(protoPayload);
          }
            break;

          default:
            break;
        }
        replies.push(reply);
      });
    }
    return replies;
  }
});



// Express Spin up
const serverPort = process.env.DIALOGFLOW_PORT || 8001;
app.listen(serverPort, function() {
  let appInsightsStartServerDuration = Date.now() - appInsightsStartServerTime;
  appInsightsClient.trackMetric({name: "botja-dialogflow-start-time", value: appInsightsStartServerDuration});

  console.log(`Server up and listening on Port: ${ serverPort }`);
});