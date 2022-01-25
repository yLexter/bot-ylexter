module.exports = {
    name: "play",
    help: "Reproduz a música desejada no canal atual do usuário",
    type: 'music',
    aliase: ["p"],
    execute: (client, msg, args, cor) => {

        const { MessageEmbed } = require('discord.js');

        const { tocarPlaylist, secondsToText, spotifySearch, vdSearch, ytPlaylist, playCustomSong  } = client.music
        const s = args.join(" ");
        const spt = s.toLowerCase().includes('spotify.com')
        var resultado = s.toLowerCase().includes('list=');

        if (!s || !msg.member.voice.channel) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription('Você precisa digitar algo para por músicas ou entrar em um canal de voz primeiro.')
                .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
            return msg.channel.send({ embeds: [helpMsg] })
        }

        spt ? tocarSpotify(s) : resultado ? tocarPlaylistYt(s) : tocarVideoYt(s)

        // Spotify
        async function tocarSpotify(item) {

            function msgError() {
                const helpMsg20 = new MessageEmbed()
                    .setColor(cor)
                    .setDescription('Ocorreu um erro ao buscar sua Playlist/Música , Por Favor Tente Novamente.')
                    .addFields({ name: 'Suporte', value: 'Apenas Playlists e Tracks são Suportados.' })
                    .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg20] })
            }

            try {

                const helpMsg20 = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`⏯️ Carregando Song(s)`)
                    .setAuthor({ name: '| Spotify Playlist/Track', iconURL: msg.author.displayAvatarURL() })
                const msg_embed = await msg.channel.send({ embeds: [helpMsg20] })

                const spotify = await spotifySearch(client, msg, item)

                const spotifyObejcts = {
                    'playlist': async () => {
                        const { owner, likes, total, images, playlist, songs, duration } = spotify
                        const helpMsg100 = new MessageEmbed()
                            .setColor(cor)
                            .setDescription(`🅿️ **Playlist: [${playlist.name}](${playlist.url})**\n🆔 **Autor: [${owner.name}](${owner.url})**\n📑 **Total: ${total}**\n**❤️ Likes: ${likes}\n**🕑 **Duração: ${duration}**`)
                            .setAuthor({ name: '| 🎶 Playlist adicionada', iconURL: msg.author.displayAvatarURL() })
                        if (images[0].url) helpMsg100.setThumbnail(images[0].url)
                        await tocarPlaylist(client, msg, songs)
                        return msg_embed.edit({ embeds: [helpMsg100] }).catch(e => { })
                    },

                    'track': async () => {
                        const track = [spotify]
                        const helpMsg100 = new MessageEmbed()
                            .setColor(cor)
                            .setTitle(track[0].title)
                            .setURL(track[0].url)
                            .setAuthor({ name: '| 🎶 Track adicionada', iconURL: msg.author.displayAvatarURL() })
                        await tocarPlaylist(client, msg, track)
                        return msg_embed.edit({ embeds: [helpMsg100] }).catch(() => { })
                    }
                }

                await spotifyObejcts[spotify.type]()

            } catch (e) {
                return msgError()
            }
        }

        // Playlists
        async function tocarPlaylistYt(item) {

            try {
                const queue = client.queues.get(msg.guild.id);
                const lista2 = await ytPlaylist(client, msg, item)
                const { title, videoCount, views, channel, url, songs, total } = lista2

                const helpMsg20 = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`Adicionando **${title}** com **${videoCount}** Song(s) a queue.`)
                    .setAuthor({ name: `| 🎶 Playlist `, iconURL: msg.author.displayAvatarURL() })
                let msg_embed = await msg.channel.send({ embeds: [helpMsg20] })

                await tocarPlaylist(client, msg, songs)

                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`🅿️ **Playlist: [${title}](${url})**\n🆔 **Autor: [${channel.name}](${channel.url})**\n📑 **Total: ${videoCount}**\n**❤️ Views: ${views}\n**🕑 **Duração: ${secondsToText(total / 1000)}**`)
                    .setAuthor({ name: '| 🎶 Playlist adicionada', iconURL: msg.author.displayAvatarURL() })
                return msg_embed.edit({ embeds: [helpMsg] }).catch(() => { })

            } catch (e) {
                const helpMsg20 = new MessageEmbed()
                    .setColor(cor)
                    .setDescription('Não achei oque você procura')
                    .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg20] })
            }
        };

        // Vídeos
        async function tocarVideoYt(item) {

            try {
                const song = await vdSearch(client, msg, item)
                await playCustomSong(client , msg , song)
               
            } catch (e) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription('Não achei oque você procura')
                    .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }
        }

    }
}

