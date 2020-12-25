module.exports = {
  endCommand: endCommandFn
};

function endCommandFn(appInsightsClient) {
  return {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
      appInsightsClient.trackEvent({name: "botja-alexa", properties: { desc: "SessionEndedRequest called", req: "wrong", args: { reason: handlerInput.requestEnvelope.request.reason } }});
  
      return handlerInput.responseBuilder.getResponse();
    },
  }
};