module.exports = {
  fallbackCommand: fallbackCommandFn
};

function fallbackCommandFn(agent, appInsightsClient) {
  appInsightsClient.trackEvent({name: "botja-dialogflow", properties: { desc: "Fallback called", req: "correct", args: agent.query }});

  const fallbackPhrasesArray = [
    "I didn't get that. Can you say it again?",
    "I missed what you said. What was that?",
    "Sorry, can you say that again?",
    "Sorry, I didn't get that. Can you rephrase?",
    "I didn't get that. Can you repeat?",
    "I missed that, say that again?",
  ];

  agent.add(
    fallbackPhrasesArray[Math.floor(Math.random() * fallbackPhrasesArray.length)]
  );
  agent.add(new Suggestion("Joke"));
  agent.add(new Suggestion("Quote"));
  agent.add(new Suggestion("Movie"));
  agent.add(new Suggestion("Weather"));
};