const { logs } = require("../Jsons/config.json")
const { MessageEmbed } = require("discord.js");
const moment = require('moment')

module.exports = {
    name: 'guildCreate',
    once: false,
    execute: async (client, guild) => {

        function embedServer(data) {
            const { name, id, ownerId, memberCount, joinedAt, icon, createdAt } = data
            const iconGuild = icon || 'https://spng.pngfind.com/pngs/s/154-1548198_discord-gg-cute-discord-hd-png-download.png'
            const helpMsg = new MessageEmbed()
                .setColor("RANDOM")
                .setTitle(name)
                .setURL(iconGuild)
                .setThumbnail(iconGuild)
                .setFields(
                    { name: '🆔 ID do Servidor', value: String(id) },
                    { name: '🔰 Dono do Servidor', value: `<@${ownerId}>` },
                    { name: '📅 Entrei em', value: String(moment(joinedAt).format('LLLL')), inline: true },
                    { name: '📅 Servidor criado em', value: String(moment(createdAt).format('LLLL')), inline: true },
                    { name: '🔱 Total de Membros', value: `${memberCount}` },
                ).setAuthor({ name: `| ${name}`, iconURL: iconGuild })
                .setFooter({ text: 'Type: GuildAdd', iconURL: iconGuild })
            return helpMsg
        }

        client.channels.cache.get(logs.guilds).send({ embeds: [embedServer(guild)] })

    }
}