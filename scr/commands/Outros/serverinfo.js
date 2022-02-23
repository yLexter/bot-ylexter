const { MessageEmbed } = require("discord.js");
const moment = require('moment');
const local = moment.locale('pt-br');

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
                    { name: '🔱 Membros no Servidor', value: `${memberCount}` },
                    { name: '🛑 Roles', value: stringRoles }
                ).setAuthor({ name: `| ${name} `, iconURL: iconGuild })
                .setFooter({ text: `📅 Servidor criado em ${moment(createdAt).format('LLLL')} | 🆔 ${id}`, iconURL: iconGuild })
            return msg.channel.send({ embeds: [helpMsg] })
        } catch (e) { return msg.channel.send(`\`${e}\``) }
    }
};

