const { MessageEmbed, Permissions } = require("discord.js");
const { formatDate } = require('../../classes/Utils')
const Command = require('../../classes/command')

class CommandUserInfo extends Command {
  constructor() {
    super({
      name: "userinfo",
      help: "Exibe informações de um usuário",
      type: "others",
      usage: '<Comando> + <Menção ao User ou ID> || *Para ver o seu, use apenas <Comando>.',
      aliase: ["iuser"],
    })
  }

  async execute(client, msg, args) {

    const { cor } = client
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
          { name: '⭐ Dono', value: ownerGuild, },
          { name: '📅 Criação da Conta', value: formatDate(user.createdAt), inline: true },
          { name: '📅 Entrou no Servidor', value: formatDate(guild.joinedAt), inline: true },
          { name: '⭐ Administrator', value: admin, },
          { name: '🛑 Roles', value: stringRoles }
        ).setAuthor({ name: `| Info's de ${user.username}`, iconURL: urlAvatar })
        .setFooter({ text: `| 🆔 ${user.id}`, iconURL: urlAvatar })
      return msg.channel.send({ embeds: [helpMsg] })

    } catch (e) { return msg.channel.send(`\`${e}\``) }
  }
}

module.exports = CommandUserInfo

