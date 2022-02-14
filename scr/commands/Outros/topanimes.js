const { MessageEmbed } = require("discord.js");
const wait = require('util').promisify(setTimeout);
const Otaku = require('./../../Functions/animes')

module.exports = {
    name: "topanime",
    help: "Mostra a lista dos Top Animes do MyAnimeList.",
    type: "anime",
    aliase: ["tanime"],
    execute: async (client, msg, args, cor) => {

        const helpMsg1 = new MessageEmbed()
            .setAuthor({ name: `| Aguarde...`, iconURL: msg.author.displayAvatarURL() })
        let msg_embed = await msg.channel.send({ embeds: [helpMsg1] }).catch(() => { })

        try {
            let contador = 1
            const topAnimes = await Otaku.getTopAnimes()
            const msgError = '???'
            const finishCommmand = 300
            const pagsTotal = topAnimes.length - 1
         
            function getAnimeByPosition(number) {
                return topAnimes[number]
            }

            function msgEmbedAnime(info) {
                const contadorEmbed = contador + 1
                const pagstotalEmbed = pagsTotal + 1 
                const {
                    title, episodes, status, score, duration,
                    synopsis, year, images, genres, trailer
                } = info
                const generos = genres && genres.length > 0 ? genres.map((x, y, z) => {
                    return y == z.length - 1 ? `${x.name}. ` : `${x.name}, `
                }).join("\n") : msgError
                const imagem = images.jpg.image_url ? images.jpg.image_url : images.jpg.large_image_url
                const urlTrailer = trailer.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setTitle(`${title || msgError}`)
                    .setDescription(`${synopsis || msgError}`)
                    .addFields(
                        { name: 'Ano', value: `${year || msgError}`, inline: true },
                        { name: 'Status', value: `${status || msgError}`, inline: true },
                        { name: 'Gêneros', value: `${generos}`, inline: true },
                        { name: "Duração", value: `${duration || msgError}`, inline: true },
                        { name: 'Nota', value: `${score || msgError}/10`, inline: true },
                        { name: 'Episodios', value: `${episodes || msgError}`, inline: true },
                    )
                    .setAuthor({ name: `| 🏆 TopAnimes `, iconURL: msg.author.displayAvatarURL() })
                    .setFooter({ text: ` Pag's ${contadorEmbed}/${pagstotalEmbed}` })
                    .setURL(urlTrailer)
                if (imagem) helpMsg.setThumbnail(imagem);
                return helpMsg
            }

            function mudarMsg(number) {
                const atualAnime = getAnimeByPosition(number)
                const pagAtual = msgEmbedAnime(atualAnime)
                return msg_embed.edit({ embeds: [pagAtual] }).catch(() => { })
            }

            function firstPag() {
                contador = 0
                return mudarMsg(0)
            }

            const filter = (reaction, user) => {
                return (reaction.emoji.name == '⏪' || reaction.emoji.name == '🔁' || reaction.emoji.name == '⏩') && user.id == msg.author.id
            };

            await firstPag()
            await msg_embed.react('⏪');
            await msg_embed.react('⏩');

            const collector = await msg_embed.createReactionCollector({ filter, time: finishCommmand * 1000 });

            collector.on('collect', async (reaction, user) => {
                try {
                    await wait(0.5 * 1000)
                
                    const reactions = {
                        '⏩': () => {
                            if (pagsTotal == 0) return;
                            if (contador == pagsTotal) return firstPag();
                            contador++
                            return mudarMsg(contador)
                        },
                        '⏪': () => {
                            if (pagsTotal == 0) return;
                            if (contador == 0) {
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
                .setAuthor({ name: `| Ops, Tente Novamente.`, iconURL: msg.author.displayAvatarURL() })
            return msg_embed.edit({ embeds: [helpMsg] }).catch(() => { })
        }
    }
}






