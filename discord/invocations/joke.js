const fetch = require("node-fetch");

module.exports = {
  jokeCommand: jokeCommandFn
};

// Joke Command
function jokeCommandFn(allArguments, receivedMessage, appInsightsClient) {
  let myHeaders = {
    'User-Agent' : 'Drabkirn Botja - Discord - (https://drabkirn.cdadityang.xyz) - drabkirn@cdadityang.xyz',
    'Accept' : 'application/json'
  };

  if(allArguments.length == 0) {
    fetch('https://icanhazdadjoke.com/', { method: 'GET', headers: myHeaders })
      .then((response) => response.json())
      .then((body) => {
        if(body.status == 200) {
          receivedMessage.channel.send(
            `Here's your Joke:\n${body.joke}`
          );

          appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$joke called", req: "correct", args: "none" }});
        }
        else {
          receivedMessage.channel.send(
            `Error: It looks like API is not working properly. If the problem persists, please contact us at drabkirn@cdadityang.xyz`
          );

          appInsightsClient.trackTrace({
            message: "API Error",
            severity: 3,
            properties: { name: "botja-discord", invocation: "$joke", err: body }
          });
        }
      })
      .catch((err) => {
        receivedMessage.channel.send("Exception: Sorry, there's something wrong from our end, If the problem persists, please contact us at drabkirn@cdadityang.xyz");

        appInsightsClient.trackTrace({
          message: "Network Error",
          severity: 3,
          properties: { name: "botja-discord", invocation: "$joke", err: err }
        });
      });
  }
  else if(allArguments.length == 1) {
    let numberOfJokes = parseInt(allArguments[0]);
    let userInputedNumberOfJokes = allArguments[0];
    if(!numberOfJokes || numberOfJokes < 1 || numberOfJokes > 5) {
      receivedMessage.channel.send(
        `Something is wrong with your argument, showing 5 jokes as default!`
      );
      numberOfJokes = 5;

      appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$joke called", req: "wrong", args: userInputedNumberOfJokes }});
    }
    
    fetch(`https://icanhazdadjoke.com/search?page=1&limit=${numberOfJokes}`, { method: 'GET', headers: myHeaders })
      .then((response) => response.json())
      .then((body) => {
        if(body.status == 200){
          receivedMessage.channel.send(`Here are your ${numberOfJokes} jokes: \n`);
          body.results.forEach((joke) => {
            receivedMessage.channel.send(`${joke.joke} \n`);
          });

          appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$joke called", req: "correct", args: numberOfJokes }});
        }
        else {
          receivedMessage.channel.send(
            `Error: It looks like API is not working properly. If the problem persists, please contact us at drabkirn@cdadityang.xyz`
          );

          appInsightsClient.trackTrace({
            message: "API Error",
            severity: 3,
            properties: { name: "botja-discord", invocation: "$joke", err: body }
          });
        }
      })
      .catch((err) => {
        receivedMessage.channel.send("Exception: Sorry, there's something wrong from our end, If the problem persists, please contact us at drabkirn@cdadityang.xyz");

        appInsightsClient.trackTrace({
          message: "Network Error",
          severity: 3,
          properties: { name: "botja-discord", invocation: "$joke", err: err }
        });
      });
  }
  else {
    receivedMessage.channel.send("Please provide proper arguments. Try `$help joke` to see complete syntax of this command!");

    appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$joke called", req: "wrong", args: allArguments }});
  }
};