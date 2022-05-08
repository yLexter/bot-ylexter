const { MessageEmbed } = require("discord.js");
const { formatDate } = require('../../Functions/Utils')

module.exports = {
    name: "serverinfo",
    help: "Exibe informações do Servidor.",
    type: "others",
    aliase: ["iserver"],
    execute: async (client, msg, args, cor) => {
        try {
            const { id, name, roles, ownerId, memberCount, createdAt } = msg.guild
            const stringRoles = ([...roles.cache.values()]).map((x, y, z) => { return z.length - 1 == y ? `${x.name}.` : `${x.name}, ` }).join('\n') || '??'
            const iconGuild = msg.guild.iconURL() || 'https://spng.pngfind.com/pngs/s/154-1548198_discord-gg-cute-discord-hd-png-download.png'

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setThumbnail(iconGuild)
                .setFields(
                    { name: '🔰 Dono do Servidor', value: `<@${ownerId}>` },
                    { name: '📅 Entrei em', value: formatDate(msg.guild.me.joinedAt), inline: true },
                    { name: '📅 Servidor criado em', value: formatDate(createdAt), inline: true },
                    { name: '🔱 Total de Membros', value: `${memberCount}` },
                    { name: '🛑 Roles', value: stringRoles }
                ).setAuthor({ name: `| ${name} `, iconURL: iconGuild })
                .setFooter({ text: ` | 🆔 ${id}`, iconURL: iconGuild })
            return msg.channel.send({ embeds: [helpMsg] })
        } catch (e) { return msg.channel.send(`\`${e}\``) }
    }
};

