module.exports = {
  helpCommand: helpCommandFn
};

// The helpCommand function which shows all the commands available
function helpCommandFn(allArguments, receivedMessage){
  if(allArguments.length == 0){
    receivedMessage.channel.send(
      "Here are the list of commands: \n\n" + 
      "`$joke` - Tells you a random small and tiny joke. \n\n" +
      "`$help [topic]` - To get more info on specific topic. Ex: `$help movies`"
    );
  } else {
    let topicArgument = allArguments[0].toLowerCase();
    if(topicArgument == "joke"){
      
      receivedMessage.channel.send(
        "**Command:**  `$joke` \n" + 
        "**Description:**  Tells you a random small and tiny joke. \n" +
        "**Arguments:**  one OPTIONAL argument: \n" +
        "\t `[Number of jokes]`:  INTEGER - Must be between `1 to 5`, If something else, it defaults to 5 jokes.\n" +
        "**Examples:**  \n" +
        "\t `$joke` -  Shows one random joke\n" +
        "\t `$joke 3` -  Shows 3 jokes\n" + 
        "\t `$joke 100` -  Shows 5 jokes. We can show max 5 jokes.\n"
      );
    } else {
      receivedMessage.channel.send("You've entered wrong help topic. Please try `$help` or `$help movies` or `$help quote` to know more!");
    }
  }
};