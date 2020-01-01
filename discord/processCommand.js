let helpModule = require("./invocations/help");
let jokeModule = require("./invocations/joke");
let quoteModule = require("./invocations/quote");
let weatherModule = require("./invocations/weather");
let movieModule = require("./invocations/movie");
let aboutmeModule = require("./invocations/aboutme");

module.exports = {
  processCommand: processCommandFn
};

function processCommandFn(receivedMessage, appInsightsClient) {
  // removes $ from command - 1st char
  let fullCommand = receivedMessage.content.substr(1);
  
  // Split into the array
  let splitCommand = fullCommand.split(" ");
  
  // The first word will be the command that user sends and convert to lowerCase
  let primaryCommand = splitCommand[0].toLowerCase();
  
  // All the rest of the arguments come like this.
  let allArguments = splitCommand.slice(1);
  
  if(primaryCommand === "help") {
    helpModule.helpCommand(allArguments, receivedMessage, appInsightsClient);
  }
  else if(primaryCommand == "joke") {
    jokeModule.jokeCommand(allArguments, receivedMessage, appInsightsClient);
  }
  else if(primaryCommand == "quote") {
    quoteModule.quoteCommand(receivedMessage, appInsightsClient);
  }
  else if(primaryCommand == "weather") {
    if(requireArgumentsToWork(primaryCommand, allArguments, receivedMessage, appInsightsClient)){
      weatherModule.weatherCommand(allArguments, receivedMessage, appInsightsClient);
    }
  }
  else if(primaryCommand == "movie") {
    if(movieRequireArgumentsToWork(primaryCommand, allArguments, receivedMessage, appInsightsClient)){
      movieModule.movieCommand(allArguments, receivedMessage, appInsightsClient);
    }
  }
  else if(primaryCommand == "aboutme") {
    aboutmeModule.aboutmeCommand(receivedMessage, appInsightsClient);
  }
  else {
    receivedMessage.channel.send("Unknown command. Try `$help` to see all commands!");
  }
};


// Some commands require some arguments or won't work as expected
function requireArgumentsToWork(primaryCommand, allArguments, receivedMessage, appInsightsClient) {
  if(allArguments.length == 0){
    receivedMessage.channel.send(`You didn't specify arguments properly. Please type \`$help ${primaryCommand}\` to see list of available and required arguments for this command.`);

    appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: `$${primaryCommand} called`, req: "wrong", args: allArguments }});

    return false;
  }
  else return true;
};

function movieRequireArgumentsToWork(primaryCommand, allArguments, receivedMessage, appInsightsClient) {
  if(allArguments.length != 3){
    receivedMessage.channel.send(`You didn't specify arguments properly. Please type \`$help ${primaryCommand}\` to see list of available and required arguments for this command.`);

    appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: `$${primaryCommand} called`, req: "wrong", args: allArguments }});

    return false;
  }
  else return true;
};