module.exports = {
  repeatCommand: repeatCommandFn
};

function repeatCommandFn(appInsightsClient) {
  return {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
    },
    handle(handlerInput) {
      appInsightsClient.trackEvent({name: "botja-alexa", properties: { desc: "RepeatIntent called", req: "correct", args: "none" }});

      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

      let speakingOutput = "";
      let speakingTitle = "";
      if(sessionAttributes.lastSpeechText) {
        speakingOutput = sessionAttributes.lastSpeechText;
        speakingTitle = sessionAttributes.lastSpeechTitle;
      } else {
        speakingOutput = "There is nothing to repeat now";
        speakingTitle = "Cool Crave";
      }
  
      return handlerInput.responseBuilder
        .speak(speakingOutput)
        .reprompt(speakingOutput)
        .withSimpleCard(speakingTitle, speakingOutput)
        .getResponse();
    },
  }
};