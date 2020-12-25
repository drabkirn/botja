module.exports = {
  errorCommand: errorCommandFn
};

function errorCommandFn(appInsightsClient) {
  return {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      appInsightsClient.trackEvent({name: "botja-alexa", properties: { desc: "ErrorHandler called", req: "wrong", args: { message: error.message } }});
      const speakingOutput = `Didn't understand what you want or Maybe I've encountered some error. can you give it another try?`;
  
      return handlerInput.responseBuilder
        .speak(speakingOutput)
        .reprompt(speakingOutput)
        .withSimpleCard('Try again!', speakingOutput)
        .getResponse();
    },
  }
};