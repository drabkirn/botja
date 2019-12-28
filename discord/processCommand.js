let helpModule = require("./invocations/help");
let jokeModule = require("./invocations/joke");

module.exports = {
  processCommand: processCommandFn
};

function processCommandFn(receivedMessage){
  // removes $ from command - 1st char
  let fullCommand = receivedMessage.content.substr(1);
  
  // Split into the array
  let splitCommand = fullCommand.split(" ");
  
  // The first word will be the command that user sends and convert to lowerCase
  let primaryCommand = splitCommand[0].toLowerCase();
  
  // All the rest of the arguments come like this.
  let allArguments = splitCommand.slice(1);
  
  if(primaryCommand === "help"){
    helpModule.helpCommand(allArguments, receivedMessage);
  }

  else if(primaryCommand == "joke"){
    jokeModule.jokeCommand(allArguments, receivedMessage);
  }

  else{
    receivedMessage.channel.send("Unknown command. Try `$help` to see all commands!");
  }
};