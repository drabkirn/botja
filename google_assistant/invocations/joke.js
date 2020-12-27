const fetch = require("node-fetch");
const jokesURL = `https://icanhazdadjoke.com/`;

module.exports = {
  jokeCommand: jokeCommandFn
};

async function jokeCommandFn(conv, appInsightsClient, promptModule) {
  appInsightsClient.trackEvent({name: "botja-google-actions", properties: { desc: "Joke called", req: "correct", args: "none" }});

  const myHeaders = {
    'User-Agent': 'Cool Crave on Google Assistant | drabkirn@cdadityang.xyz | https://drabkirn.cdadityang.xyz',
    'Accept': 'application/json'
  };

  let speechText = "";
  
  await fetch(jokesURL, { method: 'GET', headers: myHeaders })
    .then((response) => response.json())
    .then((body) => {
      if(body.status == 200) {
        speechText = `Here's your Joke: ${body.joke}.. So this was the joke, hope you liked this joke, Bye bye.`;
      } else {
        appInsightsClient.trackTrace({
          message: "API Error",
          severity: 3,
          properties: { name: "botja-google-actions", invocation: "Joke", err: body }
        });

        speechText = `There was some problem connecting to Cool Crave's Engine, please try after sometime. I'm closing for now, see you soon.`;
      }
      
      promptModule.promptCommand(conv, speechText, [], [], []);
    })
    .catch((err) => {
      appInsightsClient.trackTrace({
        message: "Network Error",
        severity: 3,
        properties: { name: "botja-google-actions", invocation: "Joke", err: err }
      });

      speechText = `There was some problem connecting to Cool Crave's Engine, please try after sometime. If the problem persists, please ping me at drabkirn@cdadityang.xyz. I'm closing for now, see you soon.`;

      promptModule.promptCommand(conv, speechText, [], [], []);
    });
};