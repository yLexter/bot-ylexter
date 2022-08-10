const { MessageEmbed, } = require('discord.js');
const YouTube = require("youtube-sr").default;
const {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    NoSubscriberBehavior
} = require('@discordjs/voice');

const play = require('play-dl')
const Utils = require("./Utils")
const { getData, getTracks } = require('spotify-url-info');
const { secondsToText } = require("./Utils")

class MusicSettings {

    static backMusic(client, msg) {
        let queue = client.queues.get(msg.guild.id)
        if (queue) {
            queue.back = queue.songs.shift()
            client.queues.set(msg.guild.id, queue);
        }
    }

    static async tocarPlaylist(client, msg, item) {
        let queue = client.queues.get(msg.guild.id);

        function videosInject(playlist) {
            playlist.forEach(song => { queue.songs.push(song) })
            client.queues.set(msg.guild.id, queue)
        }

        if (queue) return videosInject(item);
        await MusicSettings.playSong(client, msg, item[0])
        queue = client.queues.get(msg.guild.id)
        videosInject(item)
        queue.songs.shift()
        client.queues.set(msg.guild.id, queue)
    }

    static musicVetor(client, msg) {
        const maxBarrinha = 10
        const barraMusic = [...Array(maxBarrinha).keys()].map(x => { return "▬" })
        const emoji = '🔵'
        const queue = client.queues.get(msg.guild.id)
        const songPaused = queue.dispatcher._state.status == 'paused'
        const song = queue.songs[0]
        const time = songPaused ? Math.floor(queue.songPlay / 1000) : Math.floor((Date.now() - queue.songPlay) / 1000)
        const timeFormatado = Utils.secondsToText(time)
        const positionBola = Math.floor(time / (song.duration / (1000 * maxBarrinha)))
        const emojiPlay = songPaused ? '▶️' : '⏸'
        barraMusic.splice(positionBola, 0, emoji)
        return `${barraMusic.join("")}\n${emojiPlay}  ${timeFormatado}/${song.durationFormatted}`
    }

    static async songSearch(client, msg, songName) {
        const incluso = item => { return songName.toLowerCase().includes(item) }
        const spTify = incluso('spotify.com')
        const sdCloud = incluso('soundcloud.')
        const ytPlaylist = incluso('list=')

        return spTify ? await spotifySearch() : sdCloud ? await soundCloudSearch() : ytPlaylist ? await ytPlaylistSearch() : await ytVideoSearch()

        async function soundCloudSearch() {
            const data = await play.soundcloud(songName)
            const { type, name, url, durationInMs, durationInSec, user } = data
            const typesData = {
                'track': () => {
                    return newSong(
                        url,
                        name,
                        songName,
                        durationInMs,
                        Utils.secondsToText(durationInSec)
                    )
                },
                'playlist': async () => {
                    const songs = (await data.all_tracks()).map(song => {
                        const { id, name, durationInMs } = song
                        return newSong(
                            `https://api.soundcloud.com/tracks/${id}`,
                            name,
                            songName,
                            durationInMs,
                            Utils.secondsToText(durationInMs / 1000))
                    })

                    return newPlaylist(
                        name,
                        songName,
                        user.name,
                        user.url,
                        songs,
                        durationInMs
                    )
                }
            }

            return typesData[type]()
        }

        async function ytVideoSearch() {

            if (songName.includes('youtube.com/watch?')) {
                var song = await YouTube.getVideo(songName)
            } else {
                const busca = await YouTube.search(songName, { limit: 3 })
                if (busca && !busca.length) throw new Error('Música não encontrada');
                var song = busca[0]
            }

            const { id, url, duration, durationFormatted, title } = song

            return newSong(
                id,
                title,
                url,
                duration,
                durationFormatted
            )

        }

        async function ytPlaylistSearch() {
            const playlist = await play.playlist_info(songName)
            const songs = playlist.videos.map(x => {
                const { id, url, title, durationRaw, durationInSec } = x
                return newSong(id, title, url, durationInSec * 1000, durationRaw)
            })

            const { title, channel, url } = playlist

            let durationPlaylist = 0

            songs.forEach(song => { durationPlaylist += song.duration })

            return newPlaylist(
                title,
                url,
                channel?.name,
                channel?.url,
                songs,
                durationPlaylist
            )

        }

        async function spotifySearch() {

            async function search_yt(msc) {
                const result = await YouTube.search(msc, { limit: 3 })
                return result[0] ? result[0] : null
            };

            const spotify = await getTracks(songName)
            const infoSpotify = await getData(songName)

            const spotifyTypes = {
                'track': async () => {
                    const titulo = `${spotify[0].name} - ${spotify[0].artists[0].name}`
                    const msc = await search_yt(titulo)

                    if (!msc) throw new Error('Música não Encontrada.');

                    const { name, external_urls, duration_ms } = spotify[0]

                    return newSong(
                        msc.id,
                        name,
                        external_urls.spotify,
                        duration_ms,
                        Utils.secondsToText(duration_ms / 1000)
                    )
                },
                'playlist': async () => {
                    const { owner, external_urls, images, name, } = infoSpotify
                    const resultado = spotify.map(x => {
                        let titulo = `${x.name} - ${x.artists[0].name}`
                        return search_yt(titulo)
                    });

                    let result_final = await Promise.all(resultado)
                    let durationTotal = 0

                    const songs = spotify.map((x, y) => {
                        const { name, external_urls, duration_ms } = spotify[y]
                        durationTotal += duration_ms

                        return newSong(
                            result_final[y].id,
                            name,
                            external_urls.spotify,
                            duration_ms,
                            Utils.secondsToText(duration_ms / 1000)
                        )
                    })

                    return newPlaylist(
                        name,
                        external_urls?.spotify,
                        owner?.display_name,
                        owner?.external_urls?.spotify,
                        songs,
                        durationTotal,
                        images[0]?.url
                    )

                },
                'album': async () => {
                    const { name, external_urls, images, artists } = infoSpotify
                    const resultado = spotify.map(x => {
                        let titulo = `${x.name} - ${x.artists[0].name ? x.artists[0].name : ""}`
                        return search_yt(titulo)
                    });

                    const artista = artists && artists.length > 0 ? artists.map(artist => {
                        const { name, url } = artist
                        return {
                            name,
                            url
                        }
                    }) : []

                    let resultSongsYt = await Promise.all(resultado)
                    let durationTotal = 0

                    const songs = spotify.map((x, y) => {
                        const { name, external_urls, duration_ms } = spotify[y]
                        durationTotal += duration_ms

                        return newSong(
                            resultSongsYt[y].id,
                            name,
                            external_urls.spotify,
                            duration_ms,
                            Utils.secondsToText(duration_ms / 1000)
                        )
                    })

                    return newPlaylist(
                        name,
                        external_urls.spotify,
                        artista[0]?.name,
                        artista[0]?.url,
                        songs,
                        durationTotal,
                        images[0]?.url
                    )

                }
            }

            return spotifyTypes[infoSpotify.type]()

        }

        function newPlaylist(namePlaylist, urlPlaylist, onwerName, urlOwner, songs, durationPlaylist, images) {
            return {
                type: 'playlist',
                playlist: {
                    name: namePlaylist,
                    url: urlPlaylist
                },
                owner: {
                    name: onwerName,
                    url: urlOwner
                },
                songs,
                totalSongs: songs.length,
                durationPlaylist: Utils.secondsToText(durationPlaylist / 1000),
                images,
            }
        }

        function newSong(id, title, url, duration, durationFormatted) {
            return {
                type: 'track',
                id,
                title,
                url,
                duration,
                durationFormatted
            }
        }

    }

    static titulo_formatado(string) {
        let remover = ["Oficial", "oficial", '[', ']'
            , '(', ')', "Music", 'music',
            "Official", "Video", "Soundtrack",
            "Vídeo", "Clipe", "Lyric", "Lyrics", "VIDEO"
            , "VÍDEO", 'MUSIC', 'OFFICIAL', 'OFICIAL', "Audio", "AUDIO", "Áudio"
            , "4K", "4k", "CLIPE", "Clipe", "dvd", "clipe", "DVD", "Dvd"
        ]
        remover.forEach(x => {
            let formated = string.replaceAll(x, "")
            string = formated
        })
        return string

    }

    static move(client, msg, oldPosition, newPosition) {
        const queue = client.queues.get(msg.guild.id);
        const songMovida = queue.songs.splice(oldPosition, 1)[0]
        queue.songs.splice(newPosition, 0, songMovida)
        client.queues.set(msg.guild.id, queue)
    }

    static loop(client, msg) {
        const queue = client.queues.get(msg.guild.id)
        const looping = queue.loop = !queue.loop

        client.queues.set(msg.guild.id, queue)
        return looping
    }

    static async seek(client, msg, secondsFinal) {
        const queue = client.queues.get(msg.guild.id)
        const song = queue.songs[0]

        if (secondsFinal >= song.duration / 1000) throw new Error('Duração maior do que o vídeo.')

        const stream = await play.stream(song.id, { seek: secondsFinal })
        const resource = createAudioResource(stream.stream, { inputType: stream.type });
        queue.dispatcher.play(resource);
        queue.connection.subscribe(queue.dispatcher)
        queue.songPlay = Date.now() - secondsFinal * 1000
        client.queues.set(msg.guild.id, queue);
    }

    static back(client, msg) {
        const queue = client.queues.get(msg.guild.id)
        const song = queue.back
        queue.songs.shift()
        queue.songs.unshift(song)
        client.queues.set(msg.guild.id, queue);
        playSong(client, msg, song)
    }

    static PushAndPlaySong(client, msg, cor, song) {
        const queue = client.queues.get(msg.guild.id);
        if (queue) {
            queue.songs.push(song);
            client.queues.set(msg.guild.id, queue);
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| 🎶 Adicionado a ${queue.songs.length - 1}° posição da queue.`, iconURL: msg.author.displayAvatarURL() })
                .setDescription(`[${song.title}](${song.url}) [${song.durationFormatted}]`)
            return msg.channel.send({ embeds: [helpMsg] })
        }
        return MusicSettings.playSong(client, msg, song)
    }

    static skip(client, msg) {
        const queue = client.queues.get(msg.guild.id)
        if (queue.loop) return MusicSettings.playSong(client, msg, queue.songs[0]);
        MusicSettings.backMusic(client, msg)
        MusicSettings.playSong(client, msg, queue.songs[0]);
    }

    static skipTo(client, msg, number) {
        const queue = client.queues.get(msg.guild.id)
        const firstMusic = queue.songs[number]

        if (queue.loop) return playSong(client, msg, queue.songs[0]);

        MusicSettings.backMusic(client, msg)
        queue.songs.splice(number - 1, 1)
        queue.songs.unshift(firstMusic)
        client.queues.set(msg.guild.id, queue)
        MusicSettings.playSong(client, msg, firstMusic);
    }

    static shuffle(client, msg) {
        const queue = client.queues.get(msg.guild.id)
        const firstMusic = queue.songs.shift()
        const backup = queue.songs
        const numeros = []

        while (queue.songs.length != numeros.length) {
            let shuffle = Math.floor(Math.random() * queue.songs.length)
            if (numeros.indexOf(shuffle) == -1) {
                numeros.push(shuffle)
            }
        }

        queue.songs = []
        numeros.forEach(element => queue.songs.push(backup[element]))
        queue.songs.unshift(firstMusic)
        client.queues.set(msg.guild.id, queue)

    }

    static pause(client, msg) {
        const queue = client.queues.get(msg.guild.id);
        queue.dispatcher.pause()
        queue.songPlay = Date.now() - queue.songPlay
        client.queues.set(msg.guild.id, queue);
    }

    static resume(client, msg) {
        const queue = client.queues.get(msg.guild.id);
        queue.dispatcher.unpause();
        queue.songPlay = Date.now() - queue.songPlay
        client.queues.set(msg.guild.id, queue);
    }

    static stop(client, msg = null) {
        const queue = client.queues.get(msg.guild.id)

        if (!queue) return;

        queue?.connection.destroy();
        queue?.message?.delete().catch(() => { })
        queue?.collector.stop()
        client.queues.delete(msg.guild.id)

        if (!msg) return;

        const helpMsg = new MessageEmbed()
            .setColor('RED')
            .setAuthor({ name: ' | ⏹️ Stopped Queue.', iconURL: client.user.displayAvatarURL() })
        return msg.channel.send({ embeds: [helpMsg] }).catch(() => { })
    }

    static async playSong(client, msg, song) {
        const { cor } = client
        const icone = msg.author.displayAvatarURL()

        try {
            let queue = client.queues.get(msg.guild.id);

            const embedNowPlay = (songNow) => {
                return new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`[${songNow.title}](${songNow.url}) [${songNow.durationFormatted}]`)
                    .setAuthor({ name: `| 🎶 Tocando Agora`, iconURL: icone })
            }

            const rowElements = () => {
                const queue = client.queues.get(msg.guild.id);
                let object = {
                    "type": 1,
                    "components": [
                        {
                            "type": 2,
                            "label": "Skip",
                            "style": 1,
                            "custom_id": "skip",
                            "emoji": "⏩"
                        },
                        {
                            "type": 2,
                            "label": "Shuffle",
                            "style": 1,
                            "custom_id": "shuffle",
                            "emoji": "🔀"
                        },
                        {
                            "type": 2,
                            "label": "Stop",
                            "style": 4,
                            "custom_id": "stop",
                            "emoji": "⏹️"
                        },
                        {
                            "type": 2,
                            "label": "Queue",
                            "style": 2,
                            "custom_id": "queue",
                            "emoji": "📝"
                        },

                    ],
                }

                if (['playing', 'buffering'].includes(queue.dispatcher._state.status)) {
                    object.components.unshift({
                        "type": 2,
                        "label": "Pause",
                        "style": 4,
                        "custom_id": "pause",
                        "emoji": "⏸"
                    })
                } else {
                    object.components.unshift({
                        "type": 2,
                        "label": "Resume",
                        "style": 3,
                        "custom_id": "resume",
                        "emoji": "▶"
                    })
                }

                let object2 = {
                    "type": 1,
                    "components": [
                        {
                            "type": 2,
                            "label": "Back",
                            "style": 1,
                            "custom_id": "back",
                            "emoji": "⏪"
                        },
                    ]
                }

                let loop = queue.loop ? 'Loop: On' : 'Loop: Off'
                let styleLoop = queue.loop ? 3 : 4

                object2.components.unshift({
                    "type": 2,
                    "label": `${loop}`,
                    "style": styleLoop,
                    "custom_id": "loop",
                    "emoji": "♾️"
                })

                return [object, object2]
            }

            if (!song) return MusicSettings.stop(client, msg);

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });
            const stream = await play.stream(song.id)
            const resource = createAudioResource(stream.stream, { inputType: stream.type });

            if (!queue) {
                var conn = joinVoiceChannel({
                    channelId: msg.member.voice.channel.id,
                    guildId: msg.guild.id,
                    adapterCreator: msg.guild.voiceAdapterCreator
                });
                queue = {
                    volume: 0.2,
                    connection: conn,
                    dispatcher: null,
                    songs: [song],
                    loop: false,
                    back: null,
                    loopQueue: false,
                    songPlay: null,
                    message: null,
                    collector: null
                }
            };

            if (queue.loopQueue && queue.songs.length == 1) {
                MusicSettings.tocarPlaylist(client, msg, queue.loopQueue);
            }

            player.play(resource);
            queue.connection.subscribe(player)
            queue.dispatcher = player
            queue.songPlay = Date.now()

            client.queues.set(msg.guild.id, queue);

            if (queue.message) queue.message.delete().catch(() => { })
            if (queue.collector) queue.collector.stop()

            queue.message = await msg.channel.send({
                embeds: [embedNowPlay(song)],
                components: rowElements()
            }).catch((e) => { console.log(e), queue.message = null })

            queue.collector = queue.message.createMessageComponentCollector({
                filter: i => i.member.voice.channel,
                componentType: 'BUTTON',
            });

            queue.collector.on('collect', i => {

                const queue = client.queues.get(msg.guild.id);

                if (i.member.voice.channel != queue?.connection?.joinConfig.channelId) {
                    const helpMsg = new MessageEmbed()
                        .setColor(cor)
                        .setAuthor({ name: `| ❌ Você precisa estar no mesmo canal de voz que eu!`, iconURL: i.user.displayAvatarURL() })
                    return i.reply({ embeds: [helpMsg], ephemeral: true })
                }

                if (!queue) return i.deferUpdate();
                if (queue?.dispatcher?._state?.status == 'idle') return;

                const objects = {
                    'pause': () => {
                        MusicSettings.pause(client, msg)
                        i.update({ components: rowElements() })
                    },
                    'resume': () => {
                        MusicSettings.resume(client, msg)
                        i.update({ components: rowElements() })
                    },
                    'queue': () => {
                        const quantidadeSongs = queue.songs.length - 1 == 0 ? 1 : queue.songs.length - 1
                        const pags = () => {
                            const total = queue.songs.length - 1
                            return total < 10 ? 1 : Math.ceil((total / 10))
                        }
                        const songsString = () => {
                            const { musicVetor } = client.music
                            let string = `🔊 **Tocando agora**\n[${queue.songs[0].title}](${queue.songs[0].url})\n${musicVetor(client, msg)}\n\n`
                            let string2 = queue.songs.map((x, y) => {
                                return `**${y}.** [${x.title}](${x.url}) [${x.durationFormatted}]`
                            }).slice(1, 10).join("\n")
                            return string + string2
                        }

                        const somarDuration = () => {
                            const queue = client.queues.get(msg.guild.id);
                            let string = 0
                            queue.songs.forEach(x => {
                                string += x.duration
                            })
                            return string / 1000
                        }

                        const helpMsg = new MessageEmbed()
                            .setColor(cor)
                            .setDescription(songsString())
                            .setAuthor({ name: `| 📑 Queue`, iconURL: i.user.displayAvatarURL() })
                            .setFooter({ text: `Músicas: ${quantidadeSongs} | Pag's: 1/${pags()} | Tempo: ${secondsToText(somarDuration())} ` })
                        return i.reply({ embeds: [helpMsg], ephemeral: true })

                    },
                    'skip': async () => {
                        await MusicSettings.skip(client, msg)
                        i.deferUpdate()
                    },
                    'shuffle': () => {
                        let minimo = 3
                        if (queue.songs.length <= minimo) {
                            const helpMsg = new MessageEmbed()
                                .setColor(cor)
                                .setAuthor({ name: `| ❌ Quantidade de músicas da queue menor que ${minimo}`, iconURL: i.user.displayAvatarURL() })
                            return i.reply({ embeds: [helpMsg], ephemeral: true })
                        }
                        MusicSettings.shuffle(client, msg)
                        return i.reply({
                            embeds: [
                                new MessageEmbed().
                                    setAuthor({ name: '| 🔀 Queue Embaralhada Com Sucesso.', iconURL: i.user.displayAvatarURL() }).
                                    setColor(cor)
                            ]
                            , ephemeral: true
                        })
                    },
                    'stop': () => {
                        i.deferUpdate()
                        MusicSettings.stop(client, msg)
                    },
                    'back': async () => {
                        if (!queue.back) {
                            return i.reply({
                                embeds: [
                                    new MessageEmbed().
                                        setAuthor({ name: '| Não existe música para voltar', iconURL: i.user.displayAvatarURL() }).
                                        setColor(cor)
                                ]
                                , ephemeral: true
                            })
                        }
                        await MusicSettings.back(client, msg)
                        i.deferUpdate()
                    },
                    'loop': () => {
                        MusicSettings.loop(client, msg)
                        i.update({ components: rowElements() })
                    }
                }

                try {
                    objects[i.customId]()
                } catch (e) { }

            })

            player.on(AudioPlayerStatus.Idle, async () => {
                let queue = client.queues.get(msg.guild.id);
                if (!queue.loop) MusicSettings.backMusic(client, msg)

                queue.message.delete().catch(() => { })

                MusicSettings.playSong(client, msg, queue?.songs[0])
            });

            player.on("error", (e) => {
                console.log(e)
                MusicSettings.stop(client, msg)
            });

            client.queues.set(msg.guild.id, queue);

        } catch (e) {
            console.log(e)
            MusicSettings.stop(client, msg)
        }

    };


}


module.exports = MusicSettings