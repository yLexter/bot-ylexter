module.exports = {
  name: "kick",
  help: "Kicka um usuário do servidor , use: @user + Reason",
  aliase: ['kck'],
  type: "admin",
  execute: async (client, msg, args, cor) => {
    const { MessageEmbed } = require("discord.js");
    const mongoose = require('mongoose');
    const moment = require('moment');

    try {
      const local = moment.locale('pt-br');
      const memberM = msg.mentions.members.first()
      const reason = args.slice(1).join(' ');
      const data = moment().format("LLLL")
      const { modelo, dados } = await client.db.fecthGuild(client, msg)

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
        return msg.reply({ content: 'Não consigo Kickar este user.'})
      }

      let objectBan = {
        logid: "kick",
        idGuild: `${msg.guild.id}-${memberM.user.id}`,
        autor: msg.author.tag,
        nome: `${memberM.user.username}#${memberM.user.discriminator}`,
        id: memberM.user.id,
        motivo: reason,
        data: data
      }

      await modelo.findOneAndUpdate({ id: msg.guild.id }, { $push: { logs: objectBan } })

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setDescription(`O user **${memberM.user.username}#${memberM.user.discriminator}** foi banido com sucesso.`)
        .setAuthor({ name: `| ✔️ | Sucesso `, iconURL: msg.author.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] })
    } catch (e) { msg.channel.send(`\`${e}\``) }
  }
}

