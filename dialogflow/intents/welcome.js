const { Suggestion } = require('dialogflow-fulfillment');

module.exports = {
  welcomeCommand: welcomeCommandFn
};

// The welcomeCommand function
function welcomeCommandFn(agent, appInsightsClient){
  appInsightsClient.trackEvent({name: "botja-dialogflow", properties: { desc: "Welcome called", req: "correct", args: "none" }});

  agent.add(
    `Hey there from Cool Crave, I can tell you jokes, quotes, weather in your city and also suggest you movies to watch. What would you like me to do?`
  )
  agent.add(new Suggestion("Joke"));
  agent.add(new Suggestion("Quote"));
  agent.add(new Suggestion("Movie"));
  agent.add(new Suggestion("Weather"));
};