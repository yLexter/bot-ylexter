const { MessageEmbed } = require("discord.js");
const Otaku = require('./../../Functions/animes')

module.exports = {
    name: "manga",
    help: "Faz uma busca por um mangá",
    type: "anime",
    usage: '<Comando> + <Nome do mangá>',
    cooldown: 10,
    aliase: [],
    execute: async (client, msg, args, cor) => {

        const helpMsg1 = new MessageEmbed()
            .setAuthor({ name: `| Procurando...`, iconURL: msg.author.displayAvatarURL() })
            .setColor(cor)
        let msg_embed = await msg.channel.send({ embeds: [helpMsg1] }).catch(() => { })

        try {
            const s = args.join(" ")

            if (!s) {
                const helpMsg = new MessageEmbed()
                    .setAuthor({ name: `| Informe um Mangá.`, iconURL: msg.author.displayAvatarURL() })
                return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })
            }
            const data = await Otaku.searchManga(s)
            const msgError = '???'
            const { posterImage, status,
                endDate, description,
                synopsis, titles, startDate
                , averageRating, chapterCount, popularityRank, canonicalTitle } = data.attributes

            const synopsisTraduzida = await Otaku.translateSynopses(synopsis)

            function firstKeyUpper(string) {
                return string[0].toUpperCase() + string.slice(1, string.length)
            }

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setTitle(`${titles.en_jp || canonicalTitle || msgError}`)
                .setDescription(`${synopsisTraduzida || description || msgError}`)
                .addFields(
                    { name: '📅 Criado em', value: startDate || msgError, inline: true },
                    { name: '📅 Capítulo Final', value: endDate || msgError, inline: true },
                    { name: '🧾 Total de Capítulos', value: `${chapterCount || msgError}`, inline: true },
                    { name: '🆔 Status', value: firstKeyUpper(status) || msgError, inline: true },
                    { name: '⭐ Popularidade', value: `${popularityRank || msgError}`, inline: true },
                    { name: '💯 Nota', value: `${averageRating || msgError}/100`, inline: true },
                )
                .setThumbnail(`${posterImage.small || posterImage.medium}`)
                .setAuthor({ name: `| 🏆 Mangá `, iconURL: msg.author.displayAvatarURL() })
            msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })

        } catch (e) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Ops, Tente Novamente.`, iconURL: msg.author.displayAvatarURL() })
            return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })
        }
    }
}









