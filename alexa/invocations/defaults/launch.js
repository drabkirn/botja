module.exports = {
  launchCommand: launchCommandFn
};

function launchCommandFn(appInsightsClient) {
  return {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
      appInsightsClient.trackEvent({name: "botja-alexa", properties: { desc: "LaunchRequest called", req: "correct", args: "none" }});
      
      const speechText = `Hi and Welcome, I'm Cool Crave. I can tell you jokes, quotes, weather in your city and also suggest you movies to watch. What would you like me to do?`;
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('Welcome', speechText)
        .getResponse();
    },
  };
};