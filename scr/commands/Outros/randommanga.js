const { MessageEmbed } = require("discord.js");
const Otaku = require('./../../Functions/animes')

module.exports = {
    name: "randommanga",
    help: "O Darius irá recomendar um anime para você.",
    type: "anime",
    cooldown: 10,
    aliase: ["rmanga"],
    execute: async (client, msg, args, cor) => {

        const helpMsg1 = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: `| Aguarde...`, iconURL: msg.author.displayAvatarURL() })
        let msg_embed = await msg.channel.send({ embeds: [helpMsg1] }).catch(() => { })

        try {

            const finishCommmand = 600
            const filter = (reaction, user) => {
                return reaction.emoji.name == '🔁' && user.id == msg.author.id
            };

            function msgEmbedManga(info) {
                const msgError = '???'
                const {
                    title, chapters, status, published,
                    synopsis, images, genres, scored, type, url
                } = info

                const imagem = images.jpg.image_url ? images.jpg.image_url : images.webp.large_image_url
                const generos = genres && genres.length > 0 ? genres.map((x, y, z) => {
                    return y == z.length - 1 ? `${x.name}. ` : `${x.name}, `
                }).join("\n") : msgError
                const urlMAL = url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setTitle(`${title || msgError}`)
                    .setDescription(`${synopsis || msgError}`)
                    .addFields(
                        { name: '🆔 Status', value: `${status || msgError}`, inline: true },
                        { name: '💯 Nota', value: `${scored || msgError}/10`, inline: true },
                        { name: '🧾 Capítulos', value: `${chapters || msgError}`, inline: true },
                        { name: "📅 Publicação", value: `${published.string || msgError}`, inline: true },
                        { name: '📺 Type', value: `${type || msgError}`, inline: true },
                        { name: '📑 Gêneros', value: `${generos}`, inline: true },
                    )
                    .setAuthor({ name: `| 🏆 Recomendação do ${client.user.username}`, iconURL: msg.author.displayAvatarURL() })
                    .setURL(urlMAL)
                if (imagem) helpMsg.setThumbnail(imagem);
                return helpMsg
            }

            async function mudarMsgEmbed() {
                const infoManga = await Otaku.getRandomManga()
                const manga = msgEmbedManga(infoManga)
                return msg_embed.edit({ embeds: [manga] }).catch(() => { })
            }

            await mudarMsgEmbed()
            await msg_embed.react('🔁')

            const collector = await msg_embed.createReactionCollector({ filter, time: finishCommmand * 1000, max: 8 });

            collector.on('collect', async (reaction, user) => {
                const reactions = {
                    '🔁': () => {
                        return mudarMsgEmbed()
                    }
                }
                try {
                    await reactions[reaction.emoji.name]()
                    await reaction.users.remove(user.id)
                } catch (e) {
                    return
                }
            })

        } catch (e) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Ops, Tente Novamente.`, iconURL: msg.author.displayAvatarURL() })
            return msg_embed.edit({ embeds: [helpMsg] }).catch(() => { })
        }
    }
};


