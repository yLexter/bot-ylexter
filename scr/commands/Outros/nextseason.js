const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const wait = require('util').promisify(setTimeout);

module.exports = {
    name: "nextseason",
    help: "Mostra a lista dos  Animes da proxíma temporada.",
    type: "anime",
    aliase: [],
    execute: async (client, msg, args, cor) => {

        const helpMsg1 = new MessageEmbed()
            .setAuthor({ name: `| Aguarde...`, iconURL: msg.author.displayAvatarURL() })
        let msg_embed = await msg.channel.send({ embeds: [helpMsg1] }).catch(() => { })

        try {
            let contador = 1
            const urlTopAnimes = 'https://api.jikan.moe/v4/seasons/upcoming'
            const fecthUrl = await fetch(urlTopAnimes).then(response => response.json())
            const topAnimes = fecthUrl.data
            const msgError = '???'
            const finishCommmand = 300
            const pagsTotal = topAnimes.length - 1
            const infoFirstPosition = getAnimeByPosition(0)
            const firstPagina = msgEmbedAnime(infoFirstPosition)
            const msg_principal = await msg_embed.edit({ embeds: [firstPagina] })

            function getAnimeByPosition(number) {
                return topAnimes[number]
            }

            function msgEmbedAnime(info) {
                const {
                    title, status, type , 
                    synopsis, year, images, genres, trailer , rating , favorites
                } = info
                const generos = genres && genres.length > 0 ? genres.map((x, y, z) => {
                    return y == z.length - 1 ? `${x.name}. ` : `${x.name}, `
                }).join("\n") : msgError
                const imagem = images.jpg.image_url ? images.jpg.image_url : images.webp.large_image_url
                const urlTrailer = trailer.url
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setTitle(`${title || msgError}`)
                    .setDescription(`${synopsis || msgError}`)
                    .addFields(
                        { name: 'Ano', value: `${year || msgError}`, inline: true },
                        { name: 'Status', value: `${status || msgError}`, inline: true },
                        { name: 'Type', value: `${type || msgError}`, inline: true },
                        { name: 'Favoritos', value: `${favorites || msgError}`, inline: true },
                        { name: 'Idade', value: `${rating || msgError}`, inline: true },
                        { name: 'Gêneros', value: `${generos}`, inline: true },
                        )
                    .setAuthor({ name: `| 🏆 Próxima Season `, iconURL: msg.author.displayAvatarURL() })
                    .setFooter({ text: ` Pag's ${contador}/${pagsTotal}` })
                if (imagem) helpMsg.setThumbnail(imagem);
                if (urlTrailer) helpMsg.setURL(urlTrailer);
                return helpMsg
            }

            function mudarMsg(number) {
                const atualAnime = getAnimeByPosition(number)
                const pagAtual = msgEmbedAnime(atualAnime)
                return msg_principal.edit({ embeds: [pagAtual] }).catch(() => { })
            }

            function firstPag() {
                contador = 1
                return mudarMsg(0)
            }

            const filter = (reaction, user) => {
                return (reaction.emoji.name == '⏪' || reaction.emoji.name == '🔁' || reaction.emoji.name == '⏩') && user.id == msg.author.id
            };

            await msg_principal.react('⏪');
            await msg_principal.react('⏩');
            const collector = await msg_principal.createReactionCollector({ filter, time: finishCommmand * 1000 });
            collector.on('collect', async (reaction, user) => {
                try {
                    await wait(0.5 * 1000)
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






