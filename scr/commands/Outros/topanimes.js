const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const wait = require('util').promisify(setTimeout);

module.exports = {
    name: "topanime",
    help: "Mostra a lista dos Top Animes do MyAnimeList.",
    type: "anime",
    aliase: [],
    execute: async (client, msg, args, cor) => {

        const helpMsg1 = new MessageEmbed()
            .setAuthor({ name: `| Aguarde...`, iconURL: msg.author.displayAvatarURL() })
        let msg_embed = await msg.channel.send({ embeds: [helpMsg1] }).catch(() => { })

        try {
            let contador = 1
            const urlTopAnimes = 'https://api.jikan.moe/v4/top/anime'
            const fecthUrl = await fetch(urlTopAnimes).then(response => response.json())
            const topAnimes = fecthUrl.data
            const msgError = '???'
            const finishCommmand = 300
            const infoFirstPosition = getAnimeByPosition(0)
            const pagsTotal = topAnimes.length - 1
            const firstPagina = msgEmbedAnime(infoFirstPosition)
            const msg_principal = await msg_embed.edit({ embeds: [firstPagina] })

            function getAnimeByPosition(number) {
                return topAnimes[number]
            }

            function msgEmbedAnime(info) {
                const {
                    title, episodes, status, score, duration,
                    synopsis, year, images, genres, trailer
                } = info
                const generos = genres && genres.length > 0 ? genres.map((x, y, z) => {
                    return y == z.length - 1 ? `${x.name}. ` : `${x.name}, `
                }).join("\n") : msgError
                const imagem = images.jpg.image_url ? images.jpg.image_url : images[0].jpg.large_image_url
                const urlTrailer = trailer.url
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setTitle(`${title || msgError}`)
                    .setDescription(`${synopsis.replace('[Written by MAL Rewrite]', "") || msgError}`)
                    .addFields(
                        { name: 'Ano', value: `${year || msgError}`, inline: true },
                        { name: 'Status', value: `${status || msgError}`, inline: true },
                        { name: 'Gêneros', value: `${generos}`, inline: true },
                        { name: "Duração", value: `${duration || msgError}`, inline: true },
                        { name: 'Nota', value: `${score || msgError}/10`, inline: true },
                        { name: 'Episodios', value: `${episodes || msgError}`, inline: true },
                    )
                    .setAuthor({ name: `| 🏆 TopAnimes `, iconURL: msg.author.displayAvatarURL() })
                    .setFooter({ text: ` Pag's ${contador}/${pagsTotal}` })
                if (imagem) helpMsg.setThumbnail(imagem);
                if(urlTrailer) helpMsg.setURL(urlTrailer);
                return helpMsg
            }

            await msg_principal.react('⏪');
            await msg_principal.react('⏩');

            const filter = (reaction, user) => {
                return (reaction.emoji.name == '⏪' || reaction.emoji.name == '🔁' || reaction.emoji.name == '⏩') && user.id == msg.author.id
            };
            const collector = await msg_principal.createReactionCollector({ filter, time: finishCommmand * 1000 });

            collector.on('collect', async (reaction, user) => {
                try {
                    await wait(0.5 * 1000)
                    function mudarMsg(number) {
                        const atualAnime = getAnimeByPosition(number)
                        const pagAtual = msgEmbedAnime(atualAnime)
                        return msg_principal.edit({ embeds: [pagAtual] }).catch(() => { })
                    }

                    function firstPag() {
                        contador = 1
                        return mudarMsg(0)
                    }

                    const reactions = {
                        '⏩': () => {
                            if (pagsTotal == 1) return;
                            if (contador == pagsTotal) return firstPag();
                            contador++
                            return mudarMsg(contador)
                        },
                        '⏪': () => {
                            if (pagsTotal == 1) return;
                            if (contador == 1) {
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
                msg_principal.delete().catch(() => { })
            })

        } catch (e) {
            const helpMsg = new MessageEmbed()
                .setAuthor({ name: `| Ops, Tente Novamente.`, iconURL: msg.author.displayAvatarURL() })
            return msg_embed.edit({ embeds: [helpMsg] }).catch(() => { })
        }
    }
}






