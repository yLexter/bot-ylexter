const { MessageEmbed } = require("discord.js");
const Youtube = require("youtube-sr").default;
const lyricsFinder = require('lyrics-finder');
const Command = require('../../classes/command')

class CommadLyrics extends Command {
    constructor() {
        super({
            name: "lyrics",
            help: "Busca a lyrics de uma música desejada",
            usage: '<Comando> + <Pesquisa>.',
            type: 'music',
            aliase: [],
        })
    }

    async execute(client, msg, args) {

        const { cor } = client

        const { titulo_formatado } = client.music

        try {
            const pesquisa = args.join(' ')

            const msgLyrics = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| 🔎 Procurando Lyrics...`, iconURL: msg.author.displayAvatarURL() })
            var msg_embed = await msg.channel.send({ embeds: [msgLyrics] })

            await searchLyrics(pesquisa)

            function lyricsFormated(letra) {
                let max = 4000
                return letra.length > max ? `${letra.substring(0, max)}...` : letra
            }

            async function tituloOfMusic(music) {
                let busca = await Youtube.searchOne(music)
                return !busca || busca.length == 0 ? `Lyrics` : titulo_formatado(busca.title)
            }

            async function searchLyrics(musica) {
                let buscarLyrics = await lyricsFinder(musica)
                if (!buscarLyrics || buscarLyrics == "") {
                    const helpMsg = new MessageEmbed()
                        .setColor(cor)
                        .setAuthor({ name: `Lyrics não encontradas`, iconURL: msg.author.displayAvatarURL() })
                    return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })
                }
                const lyrics = lyricsFormated(buscarLyrics)
                const titulo = await tituloOfMusic(musica)
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setTitle(titulo)
                    .setDescription(lyrics)
                return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })
            }

        } catch (e) {
            msg.delete().catch(() => { })
            msg_embed.delete().catch(() => { })
        }
    }
}

module.exports = CommadLyrics 



