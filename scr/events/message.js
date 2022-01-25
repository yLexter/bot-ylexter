const { MessageEmbed, Permissions } = require("discord.js");
const mongoose = require('mongoose');
const wait = require('util').promisify(setTimeout);
const { prefix } = require('./../../config.json')
const cor = '#4B0082'

module.exports = {
  name: 'messageCreate',
  once: false,
  execute: async (client, msg) => {

    try {

      if (msg.author.bot) return;

      // const xpziho = await atribuirXp()
      const { dados, modelo } = await client.db.fecthGuild(client, msg)
      const customPrefix = dados.prefix
      const prefixBot = customPrefix || prefix

      if (!msg.content.startsWith(prefixBot) || msg.channel.type === 'dm') return;

      const args = msg.content.slice(prefixBot.length).split(" ")
      const commandName = args.shift().toLowerCase()
      const cmd_aliase = client.commands.find(x => x.aliase.find(y => y == commandName))
      const command = client.commands.get(commandName) ? client.commands.get(commandName) : cmd_aliase
      const idChannel = dados.channelMusic || null

      if (!command) return;

      const typesCommands = {
        music: musica,
        others: executeCommand,
        admin: Administrador
      }

      typesCommands[command.type]();


      function executeCommand() {

        function executeCmd() {
          return client.commands.get(command.name).execute(client, msg, args, cor)
        }

        if (command.onlyOwner) {
          let dono = msg.guild.ownerID == msg.author.id
          return dono ? executeCmd() : msg.delete().catch(() => { });
        }

        executeCmd()
      }

      async function musica() {
        if (!idChannel || idChannel == msg.channel.id) {
          let queue = client.queues.get(msg.member.guild.id);
          return !queue ? executeCommand() :
            queue.connection.joinConfig.channelId == msg.member.voice.channel.id ? executeCommand() :
              msg.delete().catch(() => { })
        } else {
          const msgHelp = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: `| ❌ Erro:`, iconURL: msg.author.displayAvatarURL() })
            .setDescription(`Esse comando só é permitido no canal <#${idChannel}>`)
          let error_msc = await msg.reply({ embeds: [msgHelp] });
          await wait(8 * 1000)
          error_msc.delete().catch(() => { })
          msg.delete().catch(() => { })
        }
      }

      function Administrador() {
        let permission = msg.member.permissions.has('ADMINISTRATOR')
        return permission ? executeCommand() : msg.delete().catch(() => { })
      }

      async function atribuirXp() {
        const { xp, username, id, warns, minigames, outros } = await client.db.fecthUser(client, msg)
        const randomXp = Math.floor(Math.random() * maxXp)
        const nivelAtual = Math.floor(xp / 1000)
        const newXp = xp + randomXp
        const newNivel = Math.floor(newXp / 1000)
        const save = await userConfig.modelo.findOneAndUpdate({ id: `${msg.guild.id}-${msg.author.id}` }, { $inc: { xp: randomXp } })
        const verify = nivelAtual == newNivel

        if (!verify) {
          return msg.reply(`Parabéns ${username} , você subiu para o nivel: ${newNivel} -  ${newXp}`)
        }
      }

    } catch (e) { return console.log(e) }

  }
}