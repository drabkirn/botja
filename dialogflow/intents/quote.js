const fetch = require("node-fetch");
const quotesURL = `https://drabkirn.cdadityang.xyz/quotes`;

module.exports = {
  quoteCommand: quoteCommandFn
};

async function quoteCommandFn(agent, appInsightsClient) {
  let numberOfQuotes = agent.parameters.numberOfQuotes || 1;

  if(!numberOfQuotes || numberOfQuotes < 1 || numberOfQuotes > 2) {
    agent.add(
      `Something is wrong with your argument, showing 1 quote as default!`
    )
    numberOfQuotes = 1;

    appInsightsClient.trackEvent({name: "botja-dialogflow", properties: { desc: "Quote called", req: "wrong", args: numberOfQuotes }});
  }

  numberOfQuotes = parseInt(numberOfQuotes);

  const myHeaders = {
    'User-Agent': 'Drabkirn Botja - DialogFlow - (https://drabkirn.cdadityang.xyz) - drabkirn@cdadityang.xyz',
    'Content-Type': 'application/json',
    'Accept': 'application/drabkirn.web.v1',
    'QuotesToken': `${ process.env.QUOTES_API }`
  };
  
  await fetch(quotesURL, { method: 'GET', headers: myHeaders })
    .then((res) => res.json())
    .then((body) => {
      if(body.status == 200) {
        const randomQuotesArray = body.data.sort(() => Math.random() - Math.random()).slice(0, numberOfQuotes);
        randomQuotesArray.forEach((quoteRecord, idx) => {
          if(numberOfQuotes === 1) {
            agent.add(`${quoteRecord.content}`);
          } else {
            agent.add(`${idx + 1}. ${quoteRecord.content} \n`);
          }
        });

        appInsightsClient.trackEvent({name: "botja-dialogflow", properties: { desc: "Quote called", req: "correct", args: numberOfQuotes }});
      }
      else {
        agent.add(
          `Error: It looks like API is not working properly. If the problem persists, please contact us at drabkirn@cdadityang.xyz`
        );

        appInsightsClient.trackTrace({
          message: "API Error",
          severity: 3,
          properties: { name: "botja-dialogflow", invocation: "Quote", err: body }
        });
      }
    })
    .catch((err) => {
      agent.add("Exception: Sorry, there's something wrong from our end, If the problem persists, please contact us at drabkirn@cdadityang.xyz");

      appInsightsClient.trackTrace({
        message: "Network Error",
        severity: 3,
        properties: { name: "botja-dialogflow", invocation: "Quote", err: err }
      });
    });
}