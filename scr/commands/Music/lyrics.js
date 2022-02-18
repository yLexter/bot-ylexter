const { MessageEmbed } = require("discord.js");
const Youtube = require("youtube-sr").default;
const lyricsFinder = require('lyrics-finder');

module.exports = {
    name: "lyrics",
    help: "Busca a lyrics de uma música desejada , Usando lyrics + Posição da música em uma queue procura a mesma | Música tocando agora = 0",
    type: 'music',
    aliase: [],
    execute: async (client, msg, args, cor) => {

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

        } catch (e) {
            console.log(e)
            msg.delete().catch(() => { })
            msg_embed.delete().catch(() => { })
        }

        function lyricsFormated(letra) {
            let max = 4000
            return letra.length > 4000 ? `${letra.substring(0, max)}...` : letra
        }

        async function tituloOfMusic(artist , music) {
            let busca = await Youtube.searchOne(`${artist} ${music}`)
            return !busca || busca.length == 0 ? `Lyrics` : titulo_formatado(busca.title)
        }

        async function searchLyrics(artist, music) {

            let buscarLyrics = await lyricsFinder(artist, music)

            if (!buscarLyrics || buscarLyrics == "") {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `Lyrics não encontradas`, iconURL: msg.author.displayAvatarURL() })
                return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })
            }

            const lyrics = lyricsFormated(buscarLyrics)
            const titulo = await tituloOfMusic(artist , music)

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setTitle(titulo)
                .setDescription(lyrics)
            return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })
        }

        async function searchLyricsQueue(number) {
            const music = queue.songs[number]
            if (!music) {
                const MsgError = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| Insira uma posição valída da queue.`, iconURL: msg.author.displayAvatarURL() })
                return msg_embed.edit({ embeds: [MsgError] }).catch(e => { })
            } else {
                const formatado = titulo_formatado(music.title)
                return searchLyrics("", formatado)
            }
        }



    }


}





