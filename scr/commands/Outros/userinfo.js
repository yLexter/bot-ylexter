const { MessageEmbed } = require("discord.js");
const moment = require('moment');
const local = moment.locale('pt-br');

module.exports = {
  name: "userinfo",
  help: "Exibe informações de um usuário",
  type: "others",
  aliase: ["iuser"],
  execute: async (client, msg, args, cor) => {

    try {
      const userInfos = msg.mentions.members.first() || msg.guild.members.cache.get(msg.author.id)
      const { user, guild, roles } = userInfos
      const stringRoles = ([...roles.cache.values()]).map((x, y, z) => { return z.length - 1 == y ? `${x.name}.` : `${x.name}, ` }).join('\n')
      const urlAvatar = userInfos.displayAvatarURL()

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setThumbnail(urlAvatar)
        .setFields(
          { name: '#️⃣ Tag', value: `${user.tag}` },
          { name: '📅 Criação da Conta', value: String(moment(user.createdAt).format('LLLL')) },
          { name: '📅 Entrou no Servidor', value: String(moment(guild.joinedAt).format('LLLL')) },
          { name: '🛑 Roles', value: stringRoles }
        ).setAuthor({ name: `| Info's de ${user.username}`, iconURL: urlAvatar })
        .setFooter({ text: `| 🆔 ${user.id}`, iconURL: urlAvatar })
      return msg.channel.send({ embeds: [helpMsg] })

    } catch (e) { return msg.channel.send(`\`${e}\``) }

  }
};

