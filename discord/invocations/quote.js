const fetch = require("node-fetch");
const quotesURL = `https://drabkirn.cdadityang.xyz/quotes`;

module.exports = {
  quoteCommand: quoteCommandFn
};

function quoteCommandFn(receivedMessage, appInsightsClient) {
  const myHeaders = {
    'User-Agent': 'Drabkirn Botja - Discord - (https://drabkirn.cdadityang.xyz) - drabkirn@cdadityang.xyz',
    'Content-Type': 'application/json',
    'Accept': 'application/drabkirn.web.v1',
    'QuotesToken': `${ process.env.QUOTES_API }`
  };
  
  fetch(quotesURL, { method: 'GET', headers: myHeaders })
    .then((res) => res.json())
    .then((body) => {
      if(body.status == 200) {
        let randomNum = Math.floor(Math.random() * body.data.length);
        receivedMessage.channel.send(
          `Here is your Drabkirn Quote:\n> ${body.data[randomNum].content}`
        );

        appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$quote called", req: "correct", args: "none" }});
      }
      else {
        receivedMessage.channel.send(
          `Error: It looks like API is not working properly. If the problem persists, please contact us at drabkirn@cdadityang.xyz`
        );

        appInsightsClient.trackTrace({
          message: "API Error",
          severity: 3,
          properties: { name: "botja-discord", invocation: "$quote", err: body }
        });
      }
    })
    .catch((err) => {
      receivedMessage.channel.send("Exception: Sorry, there's something wrong from our end, If the problem persists, please contact us at drabkirn@cdadityang.xyz");

      appInsightsClient.trackTrace({
        message: "Network Error",
        severity: 3,
        properties: { name: "botja-discord", invocation: "$quote", err: err }
      });
    });
}