const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const Otaku = require('../../classes/animes')

module.exports = {
    name: "nextseason",
    help: "Mostra a lista dos animes da próxima temporada.",
    type: "anime",
    cooldown: 40,
    aliase: ["snext"],
    execute: async (client, msg, args, cor) => {

        const helpMsg1 = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: `| Aguarde...`, iconURL: msg.author.displayAvatarURL() })
        let msg_embed = await msg.channel.send({ embeds: [helpMsg1] }).catch(() => { })

        try {
            const seasonNextAnimes = await Otaku.getNextSeason()
            const msgError = '???'
            const finishCommmand = 120
            const maxTitleLength = 85
            const menuAnimes = seasonNextAnimes.map((element, indice) => {
                const generos = element.genres && element.genres.length > 0 ? element.genres.map((x, y, z) => {
                    return y == z.length - 1 ? `${x.name}. ` : `${x.name}, `
                }).join("") : msgError
                const title = element.title && element.title.length > maxTitleLength ? `${element.title.substring(0, maxTitleLength)}...` : element.title || msgError
                const contador = indice + 1
                return {
                    label: `🌟 ${contador}. ${title}`,
                    description: generos,
                    value: String(indice)
                }
            })
            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('select')
                        .setPlaceholder('Selecione um anime.')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(menuAnimes),
                );

            const listaDeAnimes = seasonNextAnimes.map((x, y) => {
                let contador = y + 1
                return `**${contador}° [${x.title || msgError}](${x.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'})**`
            }).join('\n')

            const embedInicial = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| 🏆 Animes proxíma temporada.`, iconURL: msg.author.displayAvatarURL() })
                .setDescription(listaDeAnimes)

            await msg_embed.edit({ embeds: [embedInicial], components: [row] })

            const collector = msg_embed.createMessageComponentCollector({
                filter: i => i.user.id === msg.author.id,
                componentType: 'SELECT_MENU',
                time: finishCommmand * 1000,
                max: 28
            });

            collector.on('collect', async i => {
                try {
                    mudarMsg(i.values[0])
                    i.deferUpdate();
                } catch (e) {
                    return console.log(e)
                }
            });

            collector.on('end', collected => {
                msg_embed.edit({ components: [] }).catch(() => { })
            })

            function getAnimeByPosition(number) {
                return seasonNextAnimes[number]
            }

            function msgEmbedAnime(info) {
                const {
                    title, status, type,
                    synopsis, images, genres, trailer, rating,
                    score, aired, favorites
                } = info
                const generos = genres && genres.length > 0 ? genres.map((x, y, z) => {
                    return y == z.length - 1 ? `${x.name}. ` : `${x.name}, `
                }).join("\n") : msgError
                const imagem = images.jpg.image_url ? images.jpg.image_url : images.webp.large_image_url
                const urlTrailer = trailer.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setTitle(`${title || msgError}`)
                    .setDescription(`${synopsis || msgError}`)
                    .addFields(
                        { name: '🆔 Status', value: `${status || msgError}`, inline: true },
                        { name: '📺 Type', value: `${type || msgError}`, inline: true },
                        { name: '🌟 Favoritos', value: `${favorites || msgError}`, inline: true },
                        { name: '⚠️ Idade', value: `${rating || msgError}`, inline: true },
                        { name: '📅 Publicação', value: `${aired.string || msgError}`, inline: true },
                        { name: '📑 Gêneros', value: `${generos}`, inline: true },
                    )
                    .setAuthor({ name: `| 🏆 Next season `, iconURL: msg.author.displayAvatarURL() })
                    .setURL(urlTrailer)
                if (imagem) helpMsg.setThumbnail(imagem);
                return helpMsg
            }

            function mudarMsg(number) {
                const atualAnime = getAnimeByPosition(number)
                const pagAtual = msgEmbedAnime(atualAnime)
                return msg_embed.edit({ embeds: [pagAtual], components: [row] }).catch(() => { })
            }

        } catch (e) {
            console.log(e)
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Ops, Tente Novamente.`, iconURL: msg.author.displayAvatarURL() })
            return msg_embed.edit({ embeds: [helpMsg] }).catch(() => { })
        }
    }
}






