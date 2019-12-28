// Loading the ENV files as they are secret
require('dotenv').config({ path: '.env' });
if(process.env.APP_ENVIRONMENT == "production") require('dotenv').config({ path: '.env_production' });


// Initialize Discord JS
const Discord = require("discord.js");
const client = new Discord.Client();


// Import processCommand
let processCommandModule = require("./processCommand");


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


  // Run this when this bot is mentioned in any channel, don't run if mentioned in DM
  let isBotMentionedOnChannels = false;
  receivedMessage.mentions.users.forEach((user) => {
    if(user.id === process.env.DISCORD_BOT_ID && receivedMessage.channel.type !== "dm"){
      isBotMentionedOnChannels = true;
    }
  });

  if(isBotMentionedOnChannels){
    receivedMessage.channel.send(`Yay, I've been mentioned here. Hi ${receivedMessage.author}, Since this is a public channel and I can't reply you here, why don't you chat with me ${client.user} for better experience?`);
    return;
  }


  // Run this when a message arrives in #botja channel
  if(receivedMessage.channel.id === process.env.DISCORD_BOT_BOTJA_CHANNEL_ID){
    receivedMessage.channel.send(`Hi ${receivedMessage.author}, Since this is a public channel and I can't reply you here, why don't you chat with me ${client.user} for better experience?`);
    return;
  }


  // Don't reply or do anything when some other people are talking on other channels, except on DM
  if(receivedMessage.channel.id !== process.env.DISCORD_BOT_BOTJA_CHANNEL_ID && receivedMessage.channel.type !== "dm"){
    return;
  }


  // Start our process here
  if(receivedMessage.content.startsWith("$")){
    processCommandModule.processCommand(receivedMessage);
  }
  else{
    receivedMessage.channel.send("Hello There! And Sorry, I didn't get what you want. You can anytime send `$help` to see list of available commands.");
  }
});