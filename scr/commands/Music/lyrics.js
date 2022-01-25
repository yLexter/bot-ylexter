module.exports = {
    name: "lyrics",
    help: "Busca a lyrics de uma música desejada , Usando lyrics + Posição da música em uma queue procura a mesma.",
    type: 'music',
    aliase: [],
    execute: async (client, msg, args, cor) => {

        const { MessageEmbed } = require("discord.js");
        const Youtube = require("youtube-sr").default;
        const lyricsFinder = require('lyrics-finder');
        
        const { titulo_formatado } = client.music
        const queue = client.queues.get(msg.guild.id);

        try {
            const artist = args[0]
            const numero = Number(args[0])
            const music = args.slice(1).join(' ');

            const msgLyrics = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| 🔎 Procurando Lyrics...`, iconURL: msg.author.displayAvatarURL() })
            var msg_embed = await msg.channel.send({ embeds: [msgLyrics] })

            isNaN(numero) ? await searchLyrics(artist, music) : await searchLyricsQueue(numero)

            async function searchLyrics(artist, music) {
                let lyrics = await lyricsFinder(artist, music)

                if (!lyrics || lyrics == "") {
                    const helpMsg = new MessageEmbed()
                        .setColor(cor)
                        .setAuthor({ name: `Lyrics não encontradas`, iconURL: msg.author.displayAvatarURL() })
                    return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })
                }
                let titulo
                let busca = await Youtube.searchOne(`${artist} ${music}`)

                if (!busca) {
                    titulo = `Lyrics`
                } else {
                    titulo = titulo_formatado(busca.title)
                }

                if (lyrics.length > 6000) {
                    lyrics = lyrics.substring(0, 4000)
                }

                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setTitle(titulo)
                    .setDescription(lyrics)
                return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })
            }

            async function searchLyricsQueue(number) {
                const music = queue.songs[number]
                if (!music) {
                    var MsgError = new MessageEmbed()
                        .setColor(cor)
                        .setAuthor({ name: `| Erro ao Buscar a Lyrics.`, iconURL: msg.author.displayAvatarURL() })
                    return msg_embed.edit({ embeds: [MsgError] }).catch(e => { })
                } else {
                    let formatado = titulo_formatado(music.title)
                    return searchLyrics("", formatado)
                }
            }

        } catch (e) { return msg.delete().catch(() => { }), msg_embed.delete().catch(() => { }) }
    }


}





