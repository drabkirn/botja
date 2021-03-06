module.exports = {
  helpCommand: helpCommandFn
};

// The helpCommand function which shows all the commands available
function helpCommandFn(allArguments, receivedMessage, appInsightsClient){
  if(allArguments.length == 0) {
    appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$help called", req: "correct", args: "none" }});

    receivedMessage.channel.send(
      "Here are the list of commands(my capabilities): \n\n" +
      "`$joke` - Gives you a random small and tiny joke. \n\n" +
      "`$quote` - Gives you a random quote from Drabkirn. \n\n" +
      "`$weather` - Gives you weather info from over 2 Lakh cities. \n\n" +
      "`$movie` - Gives you movies suggestions based on your interests. \n\n" +
      "`$calc` - Does simple maths operations like addition, substraction, multiplication, division and mod. \n\n" +
      "`$aboutme` - I'll tell you a little about myself. \n\n" +
      "`$help [topic]` - To get more info on specific topic. Ex: `$help movie` or `$help quote`"
    );
  }
  else {
    let topicArgument = allArguments[0].toLowerCase();

    if(topicArgument == "joke") {
      receivedMessage.channel.send(
        "**Command:**  `$joke` \n" + 
        "**Description:**  Gives you a random small and tiny joke. \n" +
        "**Arguments:**  one OPTIONAL argument: \n" +
        "\t `[Number of jokes]`:  INTEGER - Must be between `1 to 5`, If something else, it defaults to 5 jokes.\n" +
        "**Examples:**  \n" +
        "\t `$joke` -  Shows one random joke\n" +
        "\t `$joke 3` -  Shows 3 jokes\n" + 
        "\t `$joke 100` -  Shows 5 jokes. We can show max 5 jokes.\n"
      );
    }
    else if(topicArgument == "quote") {
      receivedMessage.channel.send(
        "**Command:**  `$quote` \n" + 
        "**Description:**  Gives you a random quote from Drabkirn. \n" +
        "**Arguments:**  NONE. If you pass arguments like `$quote 2` or `$quote 2 3`, they will be ignored. \n" +
        "**Examples:**  \n" +
        "\t `$quote` -  Shows one random quote\n"
      );
    }
    else if(topicArgument == "weather"){
      receivedMessage.channel.send(
        "**Command:**  `$weather` \n" + 
        "**Description:**  Gives you weather info from over 2 Lakh cities. \n" +
        "**Arguments:**  one REQUIRED argument: \n" +
        "\t `[city name]`:  The city name whose weather info you need. If the city name is not found, it defaults to *Hyderabad* \n" +
        "**Examples:**  \n" +
        "\t `$weather london` -  Gives current weather info of London.\n" +
        "\t `$weather 123` -  City not found or is not string. So we'll default it to Hyderabad.\n" +
        "\t `$weather abc` -  We'll throw an error since no city name is not found.\n" + 
        "\t `$weather` -  We'll throw an error since no city name is mentioned.\n"
      );
    }
    else if(topicArgument == "movie") {
      receivedMessage.channel.send(
        "**Command:**  `$movie` \n" + 
        "**Description:**  Gives you movies suggestions based on your interests. \n" +
        "**Arguments:**  three REQUIRED arguments: \n" +
        "\t `[number of movies]`:  INTEGER - Maximum 5 numbers of movies can be shown as suggestions. \n" +
        "\t `[genre]`:  Supported are action, adventure, animation, comedy, crime, documentary, drama, family, history, horror, mystery, romance, triller, war\n" +
        "\t `[year]`:  INTEGER - Release year of movie!\n" +
        "**Examples:**  \n" +
        "\t `$movies 1 action 2016` -  Suggests 1 Action movie released in year 2016\n" +
        "\t `$movies 4 horror 2015` -  Suggests 4 Horror movies to watch released in year 2015\n" + 
        "\t `$movies horror 1 2011` -  Wrong arguments typed. We'll show 1 Action movie from 2017 by default!\n" +
        "\t `$movies 1 horror` -  Year argument is missing, We'll throw an error!\n"
      );
    }
    else if(topicArgument == "calc") {
      receivedMessage.channel.send(
        "**Command:**  `$calc` \n" + 
        "**Description:**  Does simple maths operations like addition, substraction, multiplication, division and mod. \n" +
        "**Arguments:**  two REQUIRED arguments: \n" +
        "\t `[operation]`:  Can be `add`, `sub`, `mul`, `div`, `mod` .\n" +
        "\t `[numbers]`:  Minimum of 2 numbers and maximum of 50 numbers to be provided separated with a `space` to perform the operation .\n" +
        "**Examples:**  \n" +
        "\t `$calc add 1 2 3` - Adds `1 + 2 + 3` and gives the result `6`.\n" +
        "\t `$calc sub 20 3 5` - Substract `20 - 3 - 5` and gives the result `12`.\n" +
        "\t `$calc mul 3 4 5 6` - Multiples `3 * 4 * 5 * 6` and gives result `360`.\n" + 
        "\t `$calc add 1` - Bad/Wrong arguments - We'll throw an error!\n" +
        "\t `$calc hello` -  Wrong operation called - We'll throw an error!"
      );
    }
    else if(topicArgument == "aboutme") {
      receivedMessage.channel.send(
        "**Command:**  `$aboutme` \n" + 
        "**Description:**  I'll tell you a little about myself. \n" +
        "**Arguments:**  NONE. If you pass arguments like `$aboutme 2` or `$aboutme abc`, they will be ignored. \n" +
        "**Examples:**  \n" +
        "\t `$aboutme` -  I'll tell you a little description about myself.\n"
      );
    }
    else {
      receivedMessage.channel.send("You've entered wrong help topic. Please try `$help` or `$help movies` or `$help quote` to know more!");
    }

    // Track corrent event if topic of Argument is included or else wrong request
    let availableCommands = ["joke", "quote", "weather", "movie", "aboutme", "calc"]
    if(availableCommands.includes(topicArgument)) {
      appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$help called", req: "correct", args: topicArgument }});
    }
    else {
      appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$help called", req: "wrong", args: allArguments }});
    }
  }
};