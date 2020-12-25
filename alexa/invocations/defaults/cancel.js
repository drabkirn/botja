module.exports = {
  cancelCommand: cancelCommandFn
};

function cancelCommandFn(appInsightsClient) {
  return {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
      appInsightsClient.trackEvent({name: "botja-alexa", properties: { desc: "CancelAndStopIntent called", req: "correct", args: "none" }});
      
      const speechText = 'Bye Bye, Cool crave hopes to see you soon!';
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Bye', speechText)
        .getResponse();
    },
  }
};