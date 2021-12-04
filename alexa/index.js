// Loading the ENV files as they are secret
require('dotenv').config({ path: '.env' });
if(process.env.APP_ENVIRONMENT === "production") require('dotenv').config({ path: '.env_production' });

// Application Insights Init
let appInsights = require('applicationinsights');
appInsights.setup(process.env.APP_INSIGHTS_INSTRUMENTATION_KEY).start();
let appInsightsClient = appInsights.defaultClient;
appInsightsClient.config.maxBatchIntervalMs = 0;

const Alexa = require('ask-sdk-core');


let quoteModule = require("./invocations/quote");
const QuoteIntentHandler = quoteModule.quoteCommand(appInsightsClient);

let jokeModule = require("./invocations/joke");
const JokeIntentHandler = jokeModule.jokeCommand(appInsightsClient);

let weatherModule = require("./invocations/weather");
const InProgressWeatherIntentHandler = weatherModule.weatherCommand(appInsightsClient, "in_progress");
const CompletedWeatherIntentHandler = weatherModule.weatherCommand(appInsightsClient, "completed");

let movieModule = require("./invocations/movie");
const InProgressMovieIntentHandler = movieModule.movieCommand(appInsightsClient, "in_progress");
const CompletedMovieIntentHandler = movieModule.movieCommand(appInsightsClient, "completed");


// Default Handlers START
let launchModule = require("./invocations/defaults/launch");
const LaunchRequestHandler = launchModule.launchCommand(appInsightsClient);

let helpModule = require("./invocations/defaults/help");
const HelpIntentHandler = helpModule.helpCommand(appInsightsClient);

let fallbackModule = require("./invocations/defaults/fallback");
const FallbackIntentHandler = fallbackModule.fallbackCommand(appInsightsClient);

let repeatModule = require("./invocations/defaults/repeat");
const RepeatIntentHandler = repeatModule.repeatCommand(appInsightsClient);

let cancelModule = require("./invocations/defaults/cancel");
const CancelAndStopIntentHandler = cancelModule.cancelCommand(appInsightsClient);

let endModule = require("./invocations/defaults/end");
const SessionEndedRequestHandler = endModule.endCommand(appInsightsClient);

let errorModule = require("./invocations/defaults/error");
const ErrorHandler = errorModule.errorCommand(appInsightsClient);
// Default Handlers END

const skillBuilder = Alexa.SkillBuilders.custom();

appInsightsClient.flush();

exports.handler = skillBuilder
  .addRequestHandlers(
    QuoteIntentHandler,
    JokeIntentHandler,
    InProgressWeatherIntentHandler,
    CompletedWeatherIntentHandler,
    InProgressMovieIntentHandler,
    CompletedMovieIntentHandler,
    LaunchRequestHandler,
    HelpIntentHandler,
    FallbackIntentHandler,
    RepeatIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
