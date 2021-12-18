const { Suggestion } = require('dialogflow-fulfillment');

module.exports = {
  aboutmeCommand: aboutmeCommandFn
};

function aboutmeCommandFn(agent, appInsightsClient) {
  appInsightsClient.trackEvent({name: "botja-dialogflow", properties: { desc: "Aboutme called", req: "correct", args: "none" }});

  agent.add(
    `A chatbot that can do most of the things to make your life easier and faster.\n` + 
    `I can tell you quotes, entertain you with jokes, suggest you movies, and much more coming down the line. For all my abilities ask me for Help\n\n` +
    `Built with ❤ in India, by cdadityang <https://go.cdadityang.xyz/drab>\n` +
    `Now, enough about myself, what can I do for you?`
  );
  agent.add(new Suggestion("Joke"));
  agent.add(new Suggestion("Quote"));
  agent.add(new Suggestion("Movie"));
  agent.add(new Suggestion("Weather"));
};