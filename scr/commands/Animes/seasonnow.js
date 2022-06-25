const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const Otaku = require('../../classes/animes')
const Command = require('../../classes/command')

class CommandSeasoNow extends Command {
    constructor() {
        super({
            name: "seasonnow",
            help: "Mostra a lista dos animes da temporada atual.",
            type: "anime",
            cooldown: 30,
            aliase: ["snow"],

        })
    }

    async execute(client, msg, args) {

        const { cor } = client
        const helpMsg1 = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: `| Aguarde...`, iconURL: msg.author.displayAvatarURL() })
        let msg_embed = await msg.channel.send({ embeds: [helpMsg1] }).catch(() => { })

        try {
            const seasonNowAnimes = await Otaku.getSeasonNow()
            const msgError = '???'
            const finishCommmand = 120
            const maxTitleLength = 85
            const menuAnimes = seasonNowAnimes.map((element, indice) => {
                const generos = element.genres && element.genres.length > 0 ? element.genres.map((x, y, z) => {
                    return y == z.length - 1 ? `${x.name}. ` : `${x.name}, `
                }).join("") : msgError
                const title = element.title && element.title.length > maxTitleLength ? `${element.tile.substring(0, maxTitleLength)}...` : element.title || msgError
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

            const listaDeAnimes = seasonNowAnimes.map((x, y) => {
                let contador = y + 1
                return `**${contador}° [${x.title || msgError}](${x.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'})**`
            }).join('\n')

            const embedInicial = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| 🏆 Animes da temporada atual.`, iconURL: msg.author.displayAvatarURL() })
                .setDescription(listaDeAnimes)

            await msg_embed.edit({ embeds: [embedInicial], components: [row] })


            function getAnimeByPosition(number) {
                return seasonNowAnimes[number]
            }

            function msgEmbedAnime(info) {
                const {
                    title, status, type,
                    synopsis, images, genres, trailer, rating,
                    score, aired
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
                        { name: '💯 Nota', value: `${score || msgError}/10`, inline: true },
                        { name: '⚠️ Idade', value: `${rating || msgError}`, inline: true },
                        { name: '📅 Publicação', value: `${aired.string || msgError}`, inline: true },
                        { name: '📑 Gêneros', value: `${generos}`, inline: true },
                    )
                    .setAuthor({ name: `| 🏆 Season Atual `, iconURL: msg.author.displayAvatarURL() })
                    .setURL(urlTrailer)
                if (imagem) helpMsg.setThumbnail(imagem);
                return helpMsg
            }

            function mudarMsg(number) {
                const atualAnime = getAnimeByPosition(number)
                const pagAtual = msgEmbedAnime(atualAnime)
                return msg_embed.edit({ embeds: [pagAtual], components: [row] }).catch(() => { })
            }

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

        } catch (e) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Ops, Tente Novamente.`, iconURL: msg.author.displayAvatarURL() })
            return msg_embed.edit({ embeds: [helpMsg] }).catch(() => { })
        }

    }
}

module.exports = CommandSeasoNow







