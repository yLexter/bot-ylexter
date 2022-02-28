const { MessageEmbed, Permissions } = require("discord.js");
const moment = require('moment');
const local = moment.locale('pt-br');

module.exports = {
  name: "userinfo",
  help: "Exibe informações de um usuário",
  type: "others",
  aliase: ["iuser"],
  execute: async (client, msg, args, cor) => {

    try {
      const userInfos = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]) || msg.member
      const { user, guild, roles } = userInfos
      const stringRoles = ([...roles.cache.values()]).map((x, y, z) => { return z.length - 1 == y ? `${x.name}. ` : `${x.name}, ` }).join('\n')
      const urlAvatar = userInfos.displayAvatarURL()
      const admin = userInfos.permissions.has('ADMINISTRATOR') ? 'Sim' : 'Não'
      const ownerGuild = user.id == msg.guild.ownerID ? 'Sim' : 'Não'

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setThumbnail(urlAvatar)
        .setFields(
          { name: '#️⃣ Tag', value: `${user.tag}` },
          { name: '⭐ Dono', value: ownerGuild, inline: true },
          { name: '📅 Criação da Conta', value: String(moment(user.createdAt).format('LLLL')), inline: true },
          { name: '📅 Entrou no Servidor', value: String(moment(guild.joinedAt).format('LLLL')), inline: true },
          { name: '⭐ Administrator', value: admin, inline: true },
          { name: '🛑 Roles', value: stringRoles }
        ).setAuthor({ name: `| Info's de ${user.username}`, iconURL: urlAvatar })
        .setFooter({ text: `| 🆔 ${user.id}`, iconURL: urlAvatar })
      return msg.channel.send({ embeds: [helpMsg] })

    } catch (e) { return msg.channel.send(`\`${e}\``) }

  }
};

