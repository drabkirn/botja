const fetch = require("node-fetch");
const quotesURL = `https://drabkirn.cdadityang.xyz/quotes`;

module.exports = {
  quoteCommand: quoteCommandFn
};

function quoteCommandFn(appInsightsClient) {
  return {
    canHandle(handlerInput) {
      const hiRequest = handlerInput.requestEnvelope.request;
      return hiRequest.type === 'IntentRequest'
        && hiRequest.intent.name === 'QuoteIntent';
    },
    async handle(handlerInput) {
      appInsightsClient.trackEvent({name: "botja-alexa", properties: { desc: "QuoteIntent called", req: "correct", args: "none" }});
      
      const myHeaders = {
        'User-Agent': 'Cool Crave on Alexa | drabkirn@cdadityang.xyz | NodeJS | AWS Lambda',
        'Content-Type': 'application/json',
        'Accept': 'application/drabkirn.web.v1',
        'QuotesToken': `${ process.env.QUOTES_API }`
      };
      
      let speechText = '';
      let errorText = 'noerror';

      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

      await fetch(quotesURL, { method: 'GET', headers: myHeaders })
        .then((response) => response.json())
        .then((body) => {
          let randomNum = Math.floor(Math.random() * body.data.length);
          speechText = body.data[randomNum].content;

          sessionAttributes.lastSpeechText = speechText;
          sessionAttributes.lastSpeechTitle = "Your Quote";
          handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        })
        .catch((err) => {
          appInsightsClient.trackTrace({
            message: "Network Error",
            severity: 3,
            properties: { name: "botja-alexa", invocation: "QuoteIntent", err: err }
          });
          
          errorText = 'Oops, Maybe there was some error, can you please try again? If the problem persists please message the admin at drabkirn@cdadityang.xyz';
        });
        
      if(errorText == 'noerror'){
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Your Quote', speechText)
            .getResponse();
      } else{
        return handlerInput.responseBuilder
            .speak(errorText)
            .reprompt(errorText)
            .withSimpleCard('API Error', errorText)
            .getResponse();
      }
    },
  }
};