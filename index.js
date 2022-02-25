const { Client, Intents, Message, User, MessageEmbed, Collection, Collector, } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

const fs = require('fs')
const path = require('path')

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config()

const commandFiles = fs.readdirSync(path.join(__dirname, "./scr/commands"))
const eventsFiles = fs.readdirSync("./scr/events")
// const slashsFiles = fs.readdirSync(path.join(__dirname, "./scr/Slashs")).filter(file => { return file.endsWith('.js') })

client.commands = new Collection();
client.queues = new Map();
client.shuffles = new Map();
client.slashs = new Collection();
client.music = require('./scr/Functions/music')

client.login(process.env.TOKEN)

for (let filename of commandFiles) {
  const stat = fs.statSync(`./scr/commands/${filename}`)
  if (stat.isDirectory()) {
    const commands2 = fs.readdirSync(path.join(__dirname, `./scr/commands/${filename}`)).filter(file => { return file.endsWith('.js') })
    commands2.forEach(element => {
      const command = require(`./scr/commands/${filename}/${element}`);
      client.commands.set(command.name, command);
    });
  } else {
    if (filename.endsWith('.js')) {
      const command = require(`./scr/commands/${filename}`);
      client.commands.set(command.name, command);
    }
  }
}

for (let eventFile of eventsFiles) {
  const evento = require(`./scr/events/${eventFile}`)
  if (evento.once) {
    client.once(evento.name, (...args) => evento.execute(client, ...args));
  } else {
    client.on(evento.name, (...args) => evento.execute(client, ...args));
  }
}

process.on('unhandledRejection', err => {
  console.log(err);
});

/* for (let file of slashsFiles) {
  const command = require(`./scr/Slashs/${file}`);
  client.slashs.set(command.name, command)
}

 const slashsCommands = client.slashs.map(cmd => {
  return cmd.data.toJSON()
})


const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
const clientId = '906324795786924082'
const guildId = '905577677635870813'

rest.put(Routes.applicationGuildCommands(clientId , guildId), { body: slashsCommands })
  .then(() => console.log('Sucesso ao registar os comandos slashs'))
  .catch(console.error);  */





