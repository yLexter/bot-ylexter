const { MessageEmbed, Permissions } = require("discord.js");
const Database = require("../Database/moongose")
const cooldown = new Map();
const cor = process.env.COR
const config = require("./../Jsons/config.json")

module.exports = {
  name: 'messageCreate',
  once: false,
  execute: async (client, msg) => {

    try {

      if (msg.author.bot || msg.channel.type === 'dm' || !msg.guild.me.permissions.has('ADMINISTRATOR')) return;

      const { dados } = await Database.fecthGuild(client, msg)
      const prefixBot = dados.prefix || process.env.PREFIX
      const verify = msg.mentions.members.first()

      if (verify && msg.content.startsWith('<') && msg.content.endsWith('>') && verify.user.id == client.user.id) {
        const canalMusic = dados.channelMusic ? `<#${dados.channelMusic}>` : '`Não Definido`'
        const msgHelp = new MessageEmbed()
          .setColor(cor)
          .setTitle("Info's e Configurações do Server")
          .setDescription(`**Prefix atual \`${prefixBot}\` \nMeu ID \`${client.user.id}\`\nCanal de Música ${canalMusic}\nLink de Convite** [Aqui](https://discord.com/oauth2/authorize?client_id=906324795786924082&scope=bot&permissions=8)`)
          .setAuthor({ name: `| Olá ${msg.author.tag}.`, iconURL: msg.author.displayAvatarURL() })
          .setFooter({ text: '| Criador do Bot: yLexter#1687', iconURL: "https://cdn.discordapp.com/avatars/288871181514440706/217633420a296c18f5d5f3bbf2ca0544.webp" })
        return msg.reply({ embeds: [msgHelp] });
      }

      if (!msg.content.startsWith(prefixBot)) return;

      const args = msg.content.slice(prefixBot.length).split(" ")
      const commandName = args.shift().toLowerCase()
      const command = client.commands.get(commandName) || client.commands.find(x => x.aliase.find(y => y == commandName))

      if (!command) return;

      const idChannel = dados.channelMusic || null
      const defaultTimeCD = command.cooldown || Number(config.cdCmd)
      const commandCooldown = `${msg.guild.id}-${command.name}`
      const cdCommand = cooldown.get(commandCooldown)
      const data = await Database.client.findOne({ id: client.user.id })
      const typesCommands = {
        music,
        admin,
        ownerBot
      }

      typesCommands[command.type] ? typesCommands[command.type]() : executeCommand()

      function executeCmd() {
        cooldown.set(commandCooldown, Date.now() / 1000)
        setTimeout(() => {
          cooldown.delete(commandCooldown)
        }, defaultTimeCD * 1000)
        return client.commands.get(command.name).execute(client, msg, args, cor)
      }

      function executeCommand() {
        const commandMan = data?.commandsMan?.find(x => { return x.name == command.name })
        if (data?.blacklist?.Users.some(x => x.id == msg.author.id)) return;
        if (data?.blacklist?.Guilds.some(x => x.id == msg.guild.id)) return msg.guild.leave();

        if (cdCommand) {
          const time = defaultTimeCD - Math.floor(Date.now() / 1000 - cdCommand) || '??'
          return msg.reply({ content: `⏰| **Este comando está em cooldown, aguarde \`${time}s.\`**` }).catch(() => { })
        }

        if (commandMan) {
          return msg.reply(`**⚠️| Este comando está em manutenção , desculpe.\nMotivo \`${commandMan.reason}\`** `)
        }
        if (command.onlyOwner) {
          let dono = msg.guild.ownerID == msg.author.id
          if (!dono) return;
          return executeCmd();
        }
        return executeCmd()
      }

      function ownerBot() {
        if (msg.author.id == config.ownerBotId) return executeCommand();
      }

      async function music() {
        if (!idChannel || idChannel == msg.channel.id) {
          let queue = client.queues.get(msg.member.guild.id);
          if (queue) {
            if (queue.dispatcher._state.status == 'idle') return;
            return queue?.connection?.joinConfig.channelId == msg.member?.voice?.channel?.id ? executeCommand() : null
          }
          return executeCommand()
        } else {
          msg.reply({ content: `🚫| **Esse comando só é Permitido no canal <#${idChannel}>**` }).catch(() => { })
        }
      }

      function admin() {
        if (msg.member.permissions.has('ADMINISTRATOR')) return executeCommand();
      }

    } catch (e) { return console.log(e) }

  }
}