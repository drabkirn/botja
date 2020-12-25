module.exports = {
  helpCommand: helpCommandFn
};

function helpCommandFn(appInsightsClient) {
  return {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
      appInsightsClient.trackEvent({name: "botja-alexa", properties: { desc: "HelpIntent called", req: "correct", args: "none" }});
      
      const speechText = `Hi, Let me help you. I can tell you jokes, quotes, weather in your city and also suggest you movies to watch. You can say "Tell me a joke" or "Tell me a quote" or "What's the weather in london?" or "Suggest me three action movies from two thousand sixteen"`;
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('Help', speechText)
        .getResponse();
    },
  }
};