const { MessageEmbed } = require("discord.js");
const moment = require('moment');
const Database = require('../../Database/moongose')
moment.locale('pt-br');

const Command = require('../../classes/command')

class CommandKick extends Command {
  constructor() {
    super({
      name: "kick",
      help: "Kicka um usuário do servidor.",
      aliase: ['kck'],
      usage: '<Comando> + <Menção ao user ou ID> + <Motivo: Opcional>',
      type: "admin",
    })
  }

  async execute(client, msg, args) {

    const { cor } = client

    try {
      const memberM = msg.mentions.members.first() || msg.guild.members.cache.get(args[0])
      const reason = args.slice(1).join(' ');

      if (!memberM || !reason) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setDescription(`Por Favor use: **Ban** + **@[Usuário]** + **[Reason]** `)
          .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
        return msg.channel.send({ embeds: [helpMsg] })
      }

      try {
        await memberM.kick(reason)
      } catch (e) {
        return msg.reply({ content: 'Não consigo Kickar este user.\nTalvez ele tenha mais permissão que eu.' })
      }

      let objectBan = {
        logid: "kick",
        autor: msg.author.tag,
        nome: `${memberM.user.tag}`,
        id: memberM.user.id,
        motivo: reason,
        data: moment(Date.now()).format("LLLL")
      }

      await Database.guild.findOneAndUpdate({ id: msg.guild.id }, { $push: { logs: objectBan } })

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setDescription(`O membro \`${memberM.user.tag}\` foi kickado com sucesso.`)
        .setAuthor({ name: `| ✔️ | Sucesso `, iconURL: msg.author.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] })
    } catch (e) { msg.channel.send(`\`${e}\``) }
  }
}

module.exports = CommandKick