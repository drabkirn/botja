module.exports = {
  aboutmeCommand: aboutmeCommandFn
};

function aboutmeCommandFn(receivedMessage, appInsightsClient) {
  receivedMessage.channel.send(
    `> A chatbot that can do most of the things to make your life easier and faster.\n` +
    `I can tell you quotes, entertain you with jokes, suggest you movies, make calculations for you, provide AI services, and much more coming down the line. For all my abilities type \`$help\`\n\n` + 
    `Built with ❤ in India, by <@${process.env.DISCORD_CDADITYANG_ID}>
    `
  );

  appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$aboutme called", req: "correct", args: "none" }});
};