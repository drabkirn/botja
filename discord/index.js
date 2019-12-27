// Loading the ENV files as they are secret
require('dotenv').config({ path: '.env' });
if(process.env.APP_ENVIRONMENT == "production") require('dotenv').config({ path: '.env_production' });


// Initialize Discord JS
const Discord = require("discord.js");
const client = new Discord.Client();


// Authenticate Discord with our Token
client.login(process.env.DISCORD_BOT_TOKEN);


// This will RUN when the Bot is ready and connected.
client.on('ready', () => {
  console.log("Connected as " + client.user.tag);
  
  client.user.setActivity(`with ${client.users.size} users`);
});



// Respond to incoming messages:
client.on('message', (receivedMessage) => {
  // Bot shouldn't reply to itself
  if(receivedMessage.author === client.user){
    return;
  }


  // Run this when a message arrives in #botja channel
  if(receivedMessage.channel.id === process.env.DISCORD_BOT_BOTJA_CHANNEL_ID){
    receivedMessage.channel.send(`Hi ${receivedMessage.author}, Since this is public, why don't you chat with me here: ${client.user} for better experience.`);
    return;
  }


  // Run this when this bot is mentioned in any channel, don't run if mentioned in DM
  let isBotMentioned = false;
  receivedMessage.mentions.users.forEach((user) => {
    if(user.id === process.env.DISCORD_BOT_ID && receivedMessage.channel.type !== "dm"){
      isBotMentioned = true;
    }
  });

  if(isBotMentioned){
    receivedMessage.channel.send(`Hey I don't respond on this ${receivedMessage.channel} or any other channels. Why don't you give me a try here: ${client.user} for better experience.`);
    return;
  }


  // Start our process here
  receivedMessage.channel.send("Hey there, let's work on it now");
});