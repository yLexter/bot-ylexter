const { MessageEmbed } = require("discord.js");
const wait = require('util').promisify(setTimeout);
const Otaku = require('../../Functions/animes')

module.exports = {
    name: "seasonnow",
    help: "Mostra a lista dos animes da temporada atual.",
    type: "anime",
    cooldown: 10,
    aliase: ["snow"],
    execute: async (client, msg, args, cor) => {

        const helpMsg1 = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: `| Aguarde...`, iconURL: msg.author.displayAvatarURL() })
        let msg_embed = await msg.channel.send({ embeds: [helpMsg1] }).catch(() => { })

        try {
            let contador = 0
            const topAnimes = await Otaku.getSeasonNow()
            const msgError = '???'
            const finishCommmand = 300
            const pagsTotal = topAnimes.length - 1
            const firstPosition = 0

            function getAnimeByPosition(number) {
                return topAnimes[number]
            }

            function msgEmbedAnime(info) {
                const contadorEmbed = contador + 1
                const pagstotalEmbed = pagsTotal + 1
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
                        { name: 'Status', value: `${status || msgError}`, inline: true },
                        { name: 'Type', value: `${type || msgError}`, inline: true },
                        { name: 'Nota', value: `${score || msgError}/10`, inline: true },
                        { name: 'Idade', value: `${rating || msgError}`, inline: true },
                        { name: 'Publicação', value: `${aired.string || msgError}`, inline: true },
                        { name: 'Gêneros', value: `${generos}`, inline: true },
                    )
                    .setAuthor({ name: `| 🏆 Season Atual `, iconURL: msg.author.displayAvatarURL() })
                    .setURL(urlTrailer)
                    .setFooter({ text: ` Pag's ${contadorEmbed}/${pagstotalEmbed}` })
                if (imagem) helpMsg.setThumbnail(imagem);
                return helpMsg
            }

            function mudarMsg(number) {
                const atualAnime = getAnimeByPosition(number)
                const pagAtual = msgEmbedAnime(atualAnime)
                return msg_embed.edit({ embeds: [pagAtual] }).catch(() => { })
            }

            function firstPag() {
                contador = firstPosition
                return mudarMsg(firstPosition)
            }

            const filter = (reaction, user) => {
                return (reaction.emoji.name == '⏪' || reaction.emoji.name == '🔁' || reaction.emoji.name == '⏩') && user.id == msg.author.id
            };

            await firstPag();
            await msg_embed.react('⏪');
            await msg_embed.react('⏩');

            const collector = await msg_embed.createReactionCollector({ filter, time: finishCommmand * 1000 });

            collector.on('collect', async (reaction, user) => {
                try {
                    await wait(0.5 * 1000)
                    const reactions = {
                        '⏩': () => {
                            if (pagsTotal == firstPosition) return;
                            if (contador == pagsTotal) return firstPag();
                            contador++
                            return mudarMsg(contador)
                        },
                        '⏪': () => {
                            if (pagsTotal == firstPosition) return;
                            if (contador == firstPosition) {
                                contador = pagsTotal
                                return mudarMsg(pagsTotal);
                            }
                            contador--
                            return mudarMsg(contador)
                        }
                    }
                    await reactions[reaction.emoji.name]()
                    await reaction.users.remove(user.id)
                } catch (e) {
                    return console.log(e)
                }
            });

            collector.on('end', collected => {
                msg_embed.delete().catch(() => { })
            })

        } catch (e) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Ops, Tente Novamente.`, iconURL: msg.author.displayAvatarURL() })
            return msg_embed.edit({ embeds: [helpMsg] }).catch(() => { })
        }
    }
}






