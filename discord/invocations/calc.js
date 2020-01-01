module.exports = {
  calcCommand: calcCommandFn
};

function calcCommandFn(allArguments, receivedMessage, appInsightsClient){
  let operationCommand = allArguments[0].toLowerCase();
  let operationArguments = allArguments.slice(1);
  
  if(operationArguments.length > 50){
    appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$calc called", req: "wrong", args: { message: "args length > 50" } }});
    
    receivedMessage.channel.send("Too many arguments. Maximum of 50 arguments can be passed for this operation. Please type `$help calc` to see list of available commands and operations.");
    return;
  }
  
  let convertedOperationCommand;
  
  if(operationCommand == "add"){
    let startZero = 0;
    convertedOperationCommand = "+";
    
    operationArguments.forEach((value) => {
      startZero += Number(value);
    });
    
    calcAnswer(operationArguments, convertedOperationCommand, startZero, receivedMessage, appInsightsClient);
  }
  
  else if(operationCommand == "sub"){
    let startSub = operationArguments[0];
    let newOperationArguments = operationArguments.slice(1);
    convertedOperationCommand = "-";
    
    newOperationArguments.forEach((value) => {
      startSub -= Number(value);
    });
    
    calcAnswer(operationArguments, convertedOperationCommand, startSub, receivedMessage, appInsightsClient);
  }
  
  else if(operationCommand == "mul"){
    let startOne = 1;
    convertedOperationCommand = "*";
    
    operationArguments.forEach((value) => {
      startOne *= Number(value);
    });
    
    calcAnswer(operationArguments, convertedOperationCommand, startOne, receivedMessage, appInsightsClient);
  }
  
  else if(operationCommand == "div"){
    let startDiv = operationArguments[0];
    let newOperationArguments = operationArguments.slice(1);
    convertedOperationCommand = "/";
    
    newOperationArguments.forEach((value) => {
      startDiv /= Number(value);
    });
    
    calcAnswer(operationArguments, convertedOperationCommand, startDiv, receivedMessage, appInsightsClient);
  }
  
  else if(operationCommand == "mod"){
    let startMod = operationArguments[0];
    let newOperationArguments = operationArguments.slice(1);
    convertedOperationCommand = "%";
    
    newOperationArguments.forEach((value) => {
      startMod %= Number(value);
    });
    
    calcAnswer(operationArguments, convertedOperationCommand, startMod, receivedMessage, appInsightsClient);
  }
  
  else{
    appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$calc called", req: "wrong", args: { operation: operationCommand } }});
    
    receivedMessage.channel.send("Invalid arguments. Please type `$help calc` to see list of available commands and operations.");
  }
}

// Calc Answer
function calcAnswer(operationArguments, convertedOperationCommand, startZero, receivedMessage, appInsightsClient){
  appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$calc called", req: "correct", args: { operation: convertedOperationCommand } }});
  
  receivedMessage.channel.send(
    "Here's your Result: " +
    operationArguments.join(` ${convertedOperationCommand} `) +
    " = " + 
    "**" +
    startZero +
    "**"
  );
}