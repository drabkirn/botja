const fetch = require("node-fetch");
const quotesURL = `https://drabkirn.cdadityang.xyz/quotes`;

module.exports = {
  quoteCommand: quoteCommandFn
};

async function quoteCommandFn(conv, appInsightsClient, promptModule) {
  appInsightsClient.trackEvent({name: "botja-google-actions", properties: { desc: "Quote called", req: "correct", args: "none" }});
      
  const myHeaders = {
    'User-Agent': 'Cool Crave on Google Assistant | drabkirn@cdadityang.xyz | NodeJS | AWS Lambda',
    'Content-Type': 'application/json',
    'Accept': 'application/drabkirn.web.v1',
    'QuotesToken': `${ process.env.QUOTES_API }`
  };
  
  let speechText = '';

  await fetch(quotesURL, { method: 'GET', headers: myHeaders })
    .then((response) => response.json())
    .then((body) => {
      if(body.status == 200) {
        let randomNum = Math.floor(Math.random() * body.data.length);
        const randomQuote = body.data[randomNum];
        speechText = `${ randomQuote.title }: ${ randomQuote.content }`;
      } else {
        appInsightsClient.trackTrace({
          message: "API Error",
          severity: 3,
          properties: { name: "botja-google-actions", invocation: "Quote", err: body }
        });

        speechText = `There was some problem connecting to Cool Crave's Engine, please try after sometime. I'm closing for now, see you soon.`;
      }

      promptModule.promptCommand(conv, speechText, [], [], []);
    })
    .catch((err) => {
      appInsightsClient.trackTrace({
        message: "Network Error",
        severity: 3,
        properties: { name: "botja-google-actions", invocation: "Quote", err: err }
      });
      
      speechText = `There was some problem connecting to Cool Crave's Engine, please try after sometime. If the problem persists, please ping me at drabkirn@cdadityang.xyz. I'm closing for now, see you soon.`;

      promptModule.promptCommand(conv, speechText, [], [], []);
    });
};