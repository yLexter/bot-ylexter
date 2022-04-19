const { MessageEmbed, Permissions } = require("discord.js");
const moment = require('moment-timezone')
moment.locale('pt-br');

module.exports = {
  name: "userinfo",
  help: "Exibe informações de um usuário",
  type: "others",
  usage: '<Comando> + <Menção ao User ou ID> || *Para ver o seu, use apenas <Comando>.',
  aliase: ["iuser"],
  execute: async (client, msg, args, cor) => {

    try {
      const userInfos = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]) || msg.member
      const { user, guild, roles } = userInfos
      const stringRoles = ([...roles.cache.values()]).map(role => { return `${role.name}` }).join(', ')
      const urlAvatar = userInfos.displayAvatarURL()
      const admin = userInfos.permissions.has('ADMINISTRATOR') ? 'Sim' : 'Não'
      const ownerGuild = user.id == msg.guild.ownerId ? 'Sim' : 'Não'

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setThumbnail(urlAvatar)
        .setFields(
          { name: '#️⃣ Tag', value: `${user.tag}` },
          { name: '⭐ Dono', value: ownerGuild,  },
          { name: '📅 Criação da Conta', value: String(moment(user.createdAt).tz('America/Sao_Paulo').format('LLLL')), inline: true },
          { name: '📅 Entrou no Servidor', value: String(moment(guild.joinedAt).tz("America/Sao_Paulo").format('LLLL')), inline: true },
          { name: '⭐ Administrator', value: admin, },
          { name: '🛑 Roles', value: stringRoles }
        ).setAuthor({ name: `| Info's de ${user.username}`, iconURL: urlAvatar })
        .setFooter({ text: `| 🆔 ${user.id}`, iconURL: urlAvatar })
      return msg.channel.send({ embeds: [helpMsg] })

    } catch (e) { return msg.channel.send(`\`${e}\``) }

  }
};

