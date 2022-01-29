const { MessageEmbed, Permissions } = require("discord.js");
const mongoose = require('mongoose');
const wait = require('util').promisify(setTimeout);
const cor = '#4B0082'

module.exports = {
  name: 'messageCreate',
  once: false,
  execute: async (client, msg) => {

    try {

      if (msg.author.bot) return;

      // const xpziho = await atribuirXp()
      const { dados } = await client.db.fecthGuild(client, msg)
      const customPrefix = dados.prefix

      const verify = msg.mentions.members.first()

      if (verify && verify.user.id == client.user.id) {
        const msgHelp = new MessageEmbed()
          .setColor(cor)
          .setDescription(`📥 Quer me Colocar no Seu Server? Clique [Aqui](https://discord.com/oauth2/authorize?client_id=906324795786924082&scope=bot&permissions=8)`)
          .setAuthor({ name: `| Olá ${msg.author.tag}.`, iconURL: msg.author.displayAvatarURL() })
          .addFields({ name: 'Meu ID', value: `${client.user.id}` },
            { name: 'Prefix Atual do Server', value: `${customPrefix} || Padrão: ${process.env.PREFIX}` },
            { name: 'Criador do Bot', value: `yLexter#1687` })
        return msg.reply({ embeds: [msgHelp] });
      }

      const prefixBot = customPrefix || process.env.PREFIX
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

      typesCommands[command.type] ? typesCommands[command.type]() : executeCommand()

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
          return msg.reply({ content: `Parabéns ${username} , você subiu para o nivel: ${newNivel} -  ${newXp}` })
        }
      }

    } catch (e) { return console.log(e) }

  }
}