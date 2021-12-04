const fetch = require("node-fetch");
const jokesURL = `https://icanhazdadjoke.com/`;

module.exports = {
  jokeCommand: jokeCommandFn
};

function jokeCommandFn(appInsightsClient) {
  return {
    canHandle(handlerInput) {
      const hiRequest = handlerInput.requestEnvelope.request;
      return hiRequest.type === 'IntentRequest'
        && hiRequest.intent.name === 'JokeIntent';
    },
    async handle(handlerInput) {
      appInsightsClient.trackEvent({name: "botja-alexa", properties: { desc: "JokeIntent called", req: "correct", args: "none" }});
      
      const myHeaders = {
        'User-Agent': 'Cool Crave on Alexa | drabkirn@cdadityang.xyz | https://drabkirn.cdadityang.xyz',
        'Accept': 'application/json'
      };
      
      let speechText = '';
      let errorText = 'noerror';

      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

      await fetch(jokesURL, { method: 'GET', headers: myHeaders })
        .then((response) => response.json())
        .then((body) => {
          if(body.status == 200) {
            speechText = `Here's your Joke: ${body.joke}`;
            
            sessionAttributes.lastSpeechText = speechText;
            sessionAttributes.lastSpeechTitle = "Your Joke";
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
          } else {
            appInsightsClient.trackTrace({
              message: "API Error",
              severity: 3,
              properties: { name: "botja-alexa", invocation: "JokeIntent", err: body }
            });
            
            errorText = 'API Endpoint error! please try again later!';
          }
        })
        .catch((err) => {
          appInsightsClient.trackTrace({
            message: "Network Error",
            severity: 3,
            properties: { name: "botja-alexa", invocation: "JokeIntent", err: err }
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