const { MessageEmbed } = require('discord.js');
const { secondsToText } = require("../../Functions/Utils")

module.exports = {
    name: "play",
    help: "Reproduz a música desejada no canal atual do usuário",
    type: 'music',
    usage: '<Comando> + <Pesquisa>',
    aliase: ["p"],
    execute: (client, msg, args, cor) => {

        const { soundCloudSearch, tocarPlaylist, spotifySearch, vdSearch, ytPlaylist, PushAndPlaySong } = client.music
        const s = args.join(" ");
        const incluso = item => { return s.toLowerCase().includes(item) }
        const spt = incluso('spotify.com')
        const sdCloud = incluso('soundcloud.com')
        const resultado = incluso('list=')

        if (!s || !msg.member.voice.channel) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription('Você precisa digitar algo para por músicas ou entrar em um canal de voz primeiro.')
                .setAuthor({ name: `| ❌ Erro`, iconURL: msg.author.displayAvatarURL() })
            return msg.channel.send({ embeds: [helpMsg] })
        }

        sdCloud ? playSoundCloud(s) : spt ? tocarSpotify(s) : resultado ? tocarPlaylistYt(s) : tocarVideoYt(s)

        async function playSoundCloud(item) {

            try {
                const data = await soundCloudSearch(client, msg, item)

                const helpMsg20 = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`⏯️ Carregando Song(s)`)
                    .setAuthor({ name: '| SoundCloud Playlist/Track', iconURL: msg.author.displayAvatarURL() })
                var msg_embed = await msg.channel.send({ embeds: [helpMsg20] })

                const soundCloudTypes = {
                    'playlist': async () => {
                        const { owner, total, playlist, songs, totalDuration } = data
                        const helpMsg100 = new MessageEmbed()
                            .setColor(cor)
                            .setDescription(`🅿️ **Playlist: [${playlist.name}](${playlist.url})**\n🆔 **Autor: [${owner.name}](${owner.url})**\n📑 **Total: ${total}**\n**🕑 Duração: ${totalDuration}**`)
                            .setAuthor({ name: '| 🎶 Playlist adicionada', iconURL: msg.author.displayAvatarURL() })
                        await tocarPlaylist(client, msg, songs)
                        return msg_embed.edit({ embeds: [helpMsg100] }).catch(e => { })
                    },

                    'track': async () => {
                        await PushAndPlaySong(client, msg, cor, data)
                        msg_embed.delete().catch(() => { })
                    }
                }

                soundCloudTypes[data.type]()

            } catch (e) {
                console.log(e)
                const helpMsg20 = new MessageEmbed()
                    .setColor(cor)
                    .setDescription('Não achei oque você procura')
                    .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
                return msg_embed.edit({ embeds: [helpMsg20] })
            }
        }

        // Spotify
        async function tocarSpotify(item) {
            try {
                const helpMsg20 = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`⏯️ Carregando Song(s)`)
                    .setAuthor({ name: '| Spotify Playlist/Track/Álbum', iconURL: msg.author.displayAvatarURL() })
                var msg_embed = await msg.channel.send({ embeds: [helpMsg20] })

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
                        const track = spotify
                        await PushAndPlaySong(client, msg, cor, track)
                        return msg_embed.delete().catch(() => { })
                    },
                    'album': async () => {
                        const { name, total, url, images, songs, duration, artista } = spotify
                        const helpMsg100 = new MessageEmbed()
                            .setColor(cor)
                            .setDescription(`🅰️ **Album: [${name}](${url})**\n📑 **Total: ${total}**\n🧑 **Artista(s): ${artista}**\n🕑 **Duração: ${duration}**`)
                            .setAuthor({ name: '| 🎶 Álbum adicionado', iconURL: msg.author.displayAvatarURL() })
                        if (images[0].url) helpMsg100.setThumbnail(images[0].url)
                        await tocarPlaylist(client, msg, songs)
                        return msg_embed.edit({ embeds: [helpMsg100] }).catch(e => { })
                    }
                }

                await spotifyObejcts[spotify.type]()

            } catch (e) {
                const helpMsg20 = new MessageEmbed()
                    .setColor(cor)
                    .setDescription('Ocorreu um erro ao buscar sua Playlist/Música , Por Favor Tente Novamente.')
                    .addFields({ name: 'Suporte', value: 'Apenas Playlists , Tracks e Álbuns são Suportados.' })
                    .setAuthor({ name: `| ❌ Erro `, iconURL: msg.author.displayAvatarURL() })
                return msg_embed.edit({ embeds: [helpMsg20] }).catch(e => { })
            }
        }

        // Playlists
        async function tocarPlaylistYt(item) {

            try {
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
                PushAndPlaySong(client, msg, cor, song)

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

