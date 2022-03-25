const { MessageEmbed } = require("discord.js");
const moment = require('moment');
const Database = require('../../Database/moongose')
moment.locale('pt-br');

module.exports = {
  name: "ban",
  help: "Bane um usuário do servidor",
  usage: '<Comando> + <Menção ao User ou ID> + <Motivo: Opcional>',
  aliase: ['b'],
  type: "admin",
  execute: async (client, msg, args, cor) => {

    try {
      const memberM = msg.mentions.members.first() || msg.guild.members.cache.get(args[0])
      const reason = args.slice(1).join(' ') || 'Não Informada.'

      if (!memberM) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `❌| Mencione um usuário. `, iconURL: msg.author.displayAvatarURL() })
        return msg.channel.send({ embeds: [helpMsg] })
      }

      try {
        await memberM.ban({ reason: reason })
      } catch (e) {
        return msg.reply({ content: '**Não Consigo Banir Este User.\nTalvez ele tenha mais permissão do que eu.**' })
      }

      let objectBan = {
        logId: "ban",
        autor: msg.author.tag,
        nome: memberM.user.tag,
        id: memberM.user.id,
        motivo: reason,
        data: moment(Date.now()).format('LLLL')
      }

      await Database.guild.findOneAndUpdate({ id: msg.guild.id }, { $push: { logs: objectBan } })

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setDescription(`**O Membro \`${memberM.user.tag}\` foi banido com sucesso.**`)
        .setAuthor({ name: `| ✔️ | Sucesso `, iconURL: msg.author.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] })
    } catch (e) { msg.channel.send(`\`${e}\``) }
  }
}

