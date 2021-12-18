const { Suggestion } = require('dialogflow-fulfillment');

module.exports = {
  helpCommand: helpCommandFn
};

// The helpCommand function which shows all the commands available
function helpCommandFn(agent, appInsightsClient){
  let helpIntentName;
  if(isNaN(parseInt(agent.parameters.helpIntentName))) helpIntentName = agent.parameters.helpIntentName;
  else helpIntentName = "all";

  helpIntentName = helpIntentName.toString().toLowerCase();

  // Track corrent event if topic of Argument is included or else wrong request
  let availableCommands = ["joke", "jokes", "quote", "quotes", "weather", "movie", "movies"]

  appInsightsClient.trackEvent({name: "botja-dialogflow", properties: { desc: "Help called", req: "correct", args: helpIntentName }});

  if(!helpIntentName || helpIntentName === "all" || !availableCommands.includes(helpIntentName)) {
    const myHelpSpeechArray = [
      "Help me on how to ask for Quotes",
      "Help me with weather",
      "Help me with a joke",
      "Help me on movie suggestions"
    ];

    agent.add(`
      Yipee, I'm finally being asked to help.\nI can tell you jokes, quotes, weather in your city and also suggest you movies to watch.\nYou can also ask me for help with individual commands like "${ myHelpSpeechArray[Math.floor(Math.random() * myHelpSpeechArray.length)] }"
    `)
    agent.add(new Suggestion("Help Joke"));
    agent.add(new Suggestion("Help Quote"));
    agent.add(new Suggestion("Help Movie"));
    agent.add(new Suggestion("Help Weather"));
  } else {
    if(helpIntentName.includes("joke")) {
      agent.add(`
        It's actually quite simple to use my Joke command. You can ask me "Tell me a joke" or "Tell me 2 jokes". I can tell you a maximum of 2 jokes at a time.
      `)
      agent.add(new Suggestion("Joke"));
      agent.add(new Suggestion("Tell me 2 Jokes"));
    } else if(helpIntentName.includes("quote")) {
      agent.add(`
        You can ask me anytime "Tell me a quote". I can tell you only 1 quote at a time.
      `)
      agent.add(new Suggestion("Tell me a Quote"));
    } else if(helpIntentName.includes("weather")) {
      agent.add(`
        I can tell the current weather from over 2 Lakh cities around the globe. You can ask me "What's the weather now in London?". It's important that you give me a city name to provide you accurate data.
      `)
      agent.add(new Suggestion("Weather in London"));
      agent.add(new Suggestion("Weather in Mumbai"));
    } else if(helpIntentName.includes("movie")) {
      agent.add(`
        I can give you movie suggestions to watch now if you're looking for some entertainment. I'll need genre, year and number of movie(s) (optional) to help you. You can ask me "Suggest me 3 action movies from 2020" or "Recommend me a romantic movie from 2019".
      `)
      agent.add(new Suggestion("3 action movies from 2021"));
      agent.add(new Suggestion("war movie from 2019"));
    }
  }
};