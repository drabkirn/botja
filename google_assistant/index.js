"use strict";

// Loading the ENV files as they are secret
require('dotenv').config({ path: '.env' });
if(process.env.APP_ENVIRONMENT === "production") require('dotenv').config({ path: '.env_production' });

// Application Insights Init
let appInsights = require('applicationinsights');
appInsights.setup(process.env.APP_INSIGHTS_INSTRUMENTATION_KEY).start();
let appInsightsClient = appInsights.defaultClient;

let appInsightsStartServerTime = Date.now();

// Actions Setup
const { conversation } = require('@assistant/conversation');
const app = conversation({debug: true});

// Express Setup
const express = require("express");
const bodyParser = require("body-parser");
const restService = express();
restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);
restService.use(bodyParser.json());
app.middleware((conv) => {
  appInsightsClient.trackEvent({name: "botja-google-actions", properties: { desc: "Conversation request", req: "correct", args: {headers: JSON.stringify(conv)} }});
});


// Modules Setup
let promptModule = require("./helpers/prompt");
let jokeModule = require("./invocations/joke");
let quoteModule = require("./invocations/quote");
let weatherModule = require("./invocations/weather");
let movieModule = require("./invocations/movie");


// Handlers START
app.handle('welcomeHandler', (conv) => {
  appInsightsClient.trackEvent({name: "botja-google-actions", properties: { desc: "Welcome called", req: "correct", args: "none" }});

  const speechText = `Hey there from Cool Crave, I can tell you jokes, quotes, weather in your city and also suggest you movies to watch. What would you like me to do?`;
  const showSuggestions = ["Quote", "Joke", "Weather in London", "3 action movies from 2019"]
  const showLinks = [{
    name: "Drabkirn Website",
    link: "https://go.cdadityang.xyz/drab"
  }];
  promptModule.promptCommand(conv, speechText, showSuggestions, showLinks, []);
});

app.handle('jokeHandler', async (conv) => {
  await jokeModule.jokeCommand(conv, appInsightsClient, promptModule);
});

app.handle('quoteHandler', async (conv) => {
  await quoteModule.quoteCommand(conv, appInsightsClient, promptModule);
});

app.handle('weatherHandler', (conv) => {
  appInsightsClient.trackEvent({name: "botja-google-actions", properties: { desc: "Weather called", req: "correct", args: "none" }});
});

app.handle('weatherInputCitySlotHandler', (conv) => {
  const speechText = `Alright, now tell me the city name so that I can give you accurate weather information about the city.`;
  const showSuggestions = ["Hyderabad", "London", "Mumbai"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], []);
});

app.handle('weatherCitySlotNoInput', (conv) => {
  const speechText = `Umm, I didn't get the city name from you. I'll give you few suggestions: Hyderabad, London or Mumbai?`;
  const showSuggestions = ["Hyderabad", "London", "Mumbai"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], []);
});

app.handle('weatherCitySlotNoInputFinal', (conv) => {
  const speechText = `Ok, it's fine if you cannot provide a city name, come back later. I'm closing for now, Bye Bye.`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});

app.handle('weatherCitySlotInputMismatch', (conv) => {
  const speechText = `Umm, I couldn't find this city, or maybe I'm yet to look for this city in the map. For now, I'll give you few suggestions: Hyderabad, London or Mumbai?`;
  const showSuggestions = ["Hyderabad", "London", "Mumbai"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], []);
});

app.handle('weatherCitySlotInputMismatchFinal', (conv) => {
  const speechText = `Ok, it's fine if you cannot provide a proper city name, come back later. I'm closing for now, Bye Bye.`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});

app.handle('weatherProcessSlotHandler', async (conv) => {
  const cityName = conv.scene.slots.cityName.value;
  await weatherModule.weatherCommand(conv, appInsightsClient, promptModule, cityName);
});


app.handle('movieHandler', (conv) => {
  appInsightsClient.trackEvent({name: "botja-google-actions", properties: { desc: "Movie called", req: "correct", args: "none" }});
});

app.handle('movieInputNumberSlotHandler', (conv) => {
  const speechText = `Alright, now tell me how many movie suggestions you want?`;
  const showSuggestions = ["3", "2", "4", "1", "5"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], []);
});

app.handle('movieNumberSlotNoInput', (conv) => {
  const speechText = `Umm, I didn't get how many suggestions you need.. I'll give you few suggestions, you can say two, three or four?`;
  const showSuggestions = ["3", "2", "4", "1", "5"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], []);
});

app.handle('movieNumberSlotNoInputFinal', (conv) => {
  const speechText = `Ok, it's fine if you cannot provide me this, come back later. I'm closing for now, Bye Bye.`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});

app.handle('movieNumberSlotNoInputMismatch', (conv) => {
  const speechText = `Umm, I couldn't this as a number. For now, I'll give you few suggestions, you can say two, three or four?`;
  const showSuggestions = ["3", "2", "4", "1", "5"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], []);
});

app.handle('movieNumberSlotNoInputMismatchFinal', (conv) => {
  const speechText = `Ok, it's fine if you cannot provide a proper number, come back later. I'm closing for now, Bye Bye.`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});

app.handle('movieInputYearSlotHandler', (conv) => {
  const speechText = `Alright, now tell me from which year you need suggestions?`;
  const showSuggestions = ["2019", "2018", "2011", "2020"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], [], []);
});

app.handle('movieYearSlotNoInput', (conv) => {
  const speechText = `Umm, I didn't get the year from you.. I'll give you few suggestions, you can say 2019, 2018 or 2011?`;
  const showSuggestions = ["2019", "2018", "2011", "2020"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], []);
});

app.handle('movieYearSlotNoInputFinal', (conv) => {
  const speechText = `Ok, it's fine if you cannot provide me this, come back later. I'm closing for now, Bye Bye.`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});

app.handle('movieYearSlotNoInputMismatch', (conv) => {
  const speechText = `Umm, I couldn't this as a Year. For now, I'll give you few suggestions, you can say 2019, 2018 or 2011?`;
  const showSuggestions = ["2019", "2018", "2011", "2020"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], []);
});

app.handle('movieYearSlotNoInputMismatchFinal', (conv) => {
  const speechText = `Ok, it's fine if you cannot provide a proper year, come back later. I'm closing for now, Bye Bye.`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});

app.handle('movieInputGenreSlotHandler', (conv) => {
  const speechText = `Alright, now tell me which genre suggestions you want?`;
  const showSuggestions = ["action", "adventure", "horror", "comedy", "animation"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], []);
});

app.handle('movieGenreSlotNoInput', (conv) => {
  const speechText = `Umm, I didn't get the genre you need.. I'll give you few suggestions, you can say action, adventure or horror?`;
  const showSuggestions = ["action", "adventure", "horror", "comedy", "animation"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], []);
});

app.handle('movieGenreSlotNoInputFinal', (conv) => {
  const speechText = `Ok, it's fine if you cannot provide me this, come back later. I'm closing for now, Bye Bye.`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});

app.handle('movieGenreSlotNoInputMismatch', (conv) => {
  const speechText = `Umm, I couldn't find this as a genre. For now, I'll give you few suggestions, you can say action, adventure or horror?`;
  const showSuggestions = ["action", "adventure", "horror", "comedy", "animation"]
  promptModule.promptCommand(conv, speechText, showSuggestions, [], []);
});

app.handle('movieGenreSlotNoInputMismatchFinal', (conv) => {
  const speechText = `Ok, it's fine if you cannot provide a proper genre, come back later. I'm closing for now, Bye Bye.`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});

app.handle('movieProcessSlotHandler', async (conv) => {
  const numberOfMovies = parseInt(conv.scene.slots.numberOfMovies.value);
  const genreOfMovies = conv.scene.slots.genreOfMovies.value.toLowerCase();;
  const yearOfMovies = parseInt(conv.scene.slots.yearOfMovies.value);
  await movieModule.movieCommand(conv, appInsightsClient, promptModule, numberOfMovies, genreOfMovies, yearOfMovies);
});
// Handlers END

// Default Handlers START
app.handle('cancelHandler', (conv) => {
  const speechText = `Alright, cool, hope to see you soon. I'll miss you. Bye Bye.`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});

app.handle('helpHandler', (conv) => {
  const speechText = `Yipee, I'm finally being asked to help. Sure, this is what I can do...`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});

app.handle('inputNoMatch', (conv) => {
  const speechText = `Umm, I didn't catch that. For now, I'll give you few suggestions, you can say "tell me a quote", "joke" or you can always ask for help.`;

  const showSuggestions = ["Quote", "Joke", "Weather in Hyderabad", "3 horror movies from 2016"]
  const showLinks = [{
    name: "Drabkirn Website",
    link: "https://go.cdadityang.xyz/drab"
  }];
  promptModule.promptCommand(conv, speechText, showSuggestions, showLinks, []);
});

app.handle('inputNoMatchFinal', (conv) => {
  const speechText = `Sorry, I still didn't catch that. You can try again later. I'm closing for now. Bye Bye.`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});

app.handle('inputNoInput', (conv) => {
  const speechText = `Umm, Am I missing something, I was expecting a reply from you. Did you know, you can always ask for help.`;

  const showSuggestions = ["Quote", "Joke", "Weather in Hyderabad", "3 horror movies from 2016"]
  const showLinks = [{
    name: "Drabkirn Website",
    link: "https://go.cdadityang.xyz/drab"
  }];
  promptModule.promptCommand(conv, speechText, showSuggestions, showLinks, []);
});

app.handle('inputNoInputFinal', (conv) => {
  const speechText = `Sorry, I still didn't get any reply from you. You can try again later. I'm closing for now. Bye Bye.`;
  promptModule.promptCommand(conv, speechText, [], [], []);
});
// Default Handlers SEND

// Express Spin up
const serverPort = process.env.ACTIONS_PORT || 8000;
restService.listen(serverPort, function() {
  let appInsightsStartServerDuration = Date.now() - appInsightsStartServerTime;
  appInsightsClient.trackMetric({name: "botja-google-actions-start-time", value: appInsightsStartServerDuration});

  console.log(`Server up and listening on Port: ${ serverPort }`);
});

restService.post("/api", app);