const fetch = require("node-fetch");
const jokesURL = `https://icanhazdadjoke.com/`;

module.exports = {
  jokeCommand: jokeCommandFn
};

async function jokeCommandFn(agent, appInsightsClient) {
  let numberOfJokes = agent.parameters.numberOfJokes || 1;
  const randomJokePageNumber = (Math.floor(Math.random() * 500) + 1);

  if(!numberOfJokes || numberOfJokes < 1 || numberOfJokes > 3) {
    agent.add(
      `Something is wrong with your argument, showing 1 joke as default!`
    )
    numberOfJokes = 1;

    appInsightsClient.trackEvent({name: "botja-dialogflow", properties: { desc: "Joke called", req: "wrong", args: numberOfJokes }});
  }

  numberOfJokes = parseInt(numberOfJokes);

  let myHeaders = {
    'User-Agent' : 'Drabkirn Botja - DialogFlow - (https://drabkirn.cdadityang.xyz) - drabkirn@cdadityang.xyz',
    'Accept' : 'application/json'
  };

  await fetch(`${ jokesURL }/search?page=${ randomJokePageNumber }&limit=${numberOfJokes}`, { method: 'GET', headers: myHeaders })
    .then((response) => response.json())
    .then((body) => {
      if(body.status == 200){
        body.results.forEach((joke) => {
          if(numberOfJokes === 1) {
            agent.add(`${joke.joke}`);
          } else {
            agent.add(`${idx + 1}. ${joke.joke} \n`);
          }
        });

        appInsightsClient.trackEvent({name: "botja-dialogflow", properties: { desc: "Joke called", req: "correct", args: numberOfJokes }});
      }
      else {
        agent.add(
          `Error: It looks like API is not working properly. If the problem persists, please contact us at drabkirn@cdadityang.xyz`
        );

        appInsightsClient.trackTrace({
          message: "API Error",
          severity: 3,
          properties: { name: "botja-dialogflow", invocation: "Joke", err: body }
        });
      }
    })
    .catch((err) => {
      agent.add("Exception: Sorry, there's something wrong from our end, If the problem persists, please contact us at drabkirn@cdadityang.xyz");

      appInsightsClient.trackTrace({
        message: "Network Error",
        severity: 3,
        properties: { name: "botja-dialogflow", invocation: "Joke", err: err }
      });
    });
};