module.exports = {
  fallbackCommand: fallbackCommandFn
};

function fallbackCommandFn(appInsightsClient) {
  return {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
      appInsightsClient.trackEvent({name: "botja-alexa", properties: { desc: "FallbackIntent called", req: "correct", args: "none" }});
  
      const speakingOutput = `Didn't understand what you want, Can you give it another try? Or you can always ask for help.`;
  
      return handlerInput.responseBuilder
        .speak(speakingOutput)
        .reprompt(speakingOutput)
        .withSimpleCard('Try again!', speakingOutput)
        .getResponse();
    },
  }
};