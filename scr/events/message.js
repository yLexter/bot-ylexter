const { MessageEmbed, Permissions } = require("discord.js");
const Database = require("../Database/moongose")
const mongoose = require('mongoose');
const wait = require('util').promisify(setTimeout);
const cooldown = new Map();
const cor = process.env.COR

module.exports = {
  name: 'messageCreate',
  once: false,
  execute: async (client, msg) => {

    try {

      if (msg.author.bot || msg.channel.type === 'dm') return;

      // const xpziho = await atribuirXp()
      const { dados } = await Database.fecthGuild(client, msg)
      const customPrefix = dados.prefix
      const prefixBot = customPrefix || process.env.PREFIX
      const verify = msg.mentions.members.first()

      if (verify && verify.user.id == client.user.id) {
        const canalMusic = dados.channelMusic ? `<#${dados.channelMusic}>` : '`Não Definido`'
        const msgHelp = new MessageEmbed()
          .setColor(cor)
          .setTitle('Infos e Configurações do Server')
          .setDescription(`Prefix atual: \`${prefixBot}\` \nMeu ID: \`${client.user.id}\`\nCanal de Música: ${canalMusic}\nLink de Convite: [Aqui](https://discord.com/oauth2/authorize?client_id=906324795786924082&scope=bot&permissions=8)`)
          .setAuthor({ name: `| Olá ${msg.author.tag}.`, iconURL: msg.author.displayAvatarURL() })
          .setFooter({ text: '| Criador do Bot: yLexter#1687', iconURL: "https://cdn.discordapp.com/avatars/288871181514440706/217633420a296c18f5d5f3bbf2ca0544.webp" })
        return msg.reply({ embeds: [msgHelp] });
      }

      if (!msg.content.startsWith(prefixBot)) return;

      const args = msg.content.slice(prefixBot.length).split(" ")
      const commandName = args.shift().toLowerCase()
      const command = client.commands.get(commandName) ? client.commands.get(commandName) : client.commands.find(x => x.aliase.find(y => y == commandName))

      if (!command) return;

      const idChannel = dados.channelMusic || null
      const defaultTimeCD = command.cooldown || 2
      const commandCooldown = `${msg.guild.id}-${command.name}`

      const typesCommands = {
        music: musica,
        others: executeCommand,
        admin: Administrador
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
        const cdCommand = cooldown.get(commandCooldown)
        if (cdCommand) {
          const time = defaultTimeCD - Math.floor(Date.now() / 1000 - cdCommand) || '??'
          return msg.reply({ content: `Este comando está em Cooldown , Aguarde ${time}(s).`}).catch(() => { })
        }

        if (command.onlyOwner) {
          let dono = msg.guild.ownerID == msg.author.id
          return dono ? executeCmd() : msg.delete().catch(() => { });
        }

        return executeCmd()
      }

      async function musica() {
        if (!idChannel || idChannel == msg.channel.id) {
          let queue = client.queues.get(msg.member.guild.id);
          if (queue) {
            if (queue.dispatcher._state.status == 'idle') return;
            return queue.connection.joinConfig.channelId == msg.member.voice.channel.id ? executeCommand() : msg.delete().catch(() => { })
          }
          return executeCommand()
        } else {
          const msgHelp = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: `| ❌ Erro`, iconURL: msg.author.displayAvatarURL() })
            .setDescription(`Esse comando só é Permitido no canal <#${idChannel}>`)
          msg.reply({ embeds: [msgHelp] }).catch(() => { })
        }
      }

      function Administrador() {
        let permission = msg.member.permissions.has('ADMINISTRATOR')
        return permission ? executeCommand() : msg.delete().catch(() => { })
      }

      async function atribuirXp() {
        const { xp, username, id, warns, minigames, outros } = await Database.fecthUser(client, msg)
        const randomXp = Math.floor(Math.random() * maxXp)
        const nivelAtual = Math.floor(xp / 1000)
        const newXp = xp + randomXp
        const newNivel = Math.floor(newXp / 1000)
        const save = await userConfig.modelo.findOneAndUpdate({ id: `${msg.guild.id}-${msg.author.id}` }, { $inc: { xp: randomXp } })
        const verify = nivelAtual == newNivel

        if (!verify) {
          return msg.reply({ content: `Parabéns ${username} , você subiu para o nivel: ${newNivel} -  ${newXp}` })
        }
      }

    } catch (e) { return console.log(e) }

  }
}