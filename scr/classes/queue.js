const { MessageEmbed, } = require('discord.js');
const { secondsToText } = require('./Utils')
const YouTube = require("youtube-sr").default;
const {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    NoSubscriberBehavior
} = require('@discordjs/voice');

const play = require('play-dl')
const { getData, getTracks } = require('spotify-url-info');

class Queue {
    constructor(client, msg) {
        this.member = msg.member
        this.guild = msg.guild
        this.user = msg.author
        this.client = client
        this.channel = msg.channel
        this.volume = 0.2
        this.songs = []
        this.looping = false
        this.loopingQueue = false
        this.connection = null
        this.dispatcher = null
        this.back = null
        this.songPlay = null
        this.message = null
        this.collector = null
        this.cor = '#4B0082'
        this.minimoShuffle = 3
    }


    musicVetor() {
        const maxBarrinha = 10
        const barraMusic = [...Array(maxBarrinha)].map(x => "▬")
        const emoji = '🔵'
        const songPaused = this.dispatcher._state.status == 'paused'
        const song = this.songs[0]
        const time = songPaused ? Math.floor(this.songPlay / 1000) : Math.floor((Date.now() - this.songPlay) / 1000)
        const positionBola = Math.floor(time / (song.duration / (1000 * maxBarrinha)))
        const emojiPlay = songPaused ? '▶️' : '⏸'
        barraMusic.splice(positionBola, 0, emoji)
        return `${barraMusic.join("")}\n${emojiPlay}  ${secondsToText(time)}/${song.durationFormatted}`
    }

    async tocarPlaylist(playlist) {
        if (this.songs.length) {
            this.songs.concat(playlist)
            return this.setQueue()
        }

        this.songs = playlist
        this.playSong(playlist[0])
        return this.setQueue()
    }

    setQueue() {
        this.client.queues.set(this.guild.id, this);
    }

    backMusic() {
        this.queue.back = this.queue.songs.shift()
        this.setQueue()
    }

    loop() {
        this.looping = !this.looping
        this.setQueue()
    }

    loopQueue() {
        this.loopingQueue = !this.loopingQueue
        this.setQueue()
    }

    move(oldPosition, newPosition) {
        const songMovida = this.songs.splice(oldPosition, 1)[0]
        this.songs.splice(newPosition, 0, songMovida)
        this.setQueue()
    }

    async shuffle() {
        if (this.songs.length < 3)
            throw new Error(`Quantidade de músicas da queue menor que ${this.minimoShuffle}`)

        const firstMusic = this.songs.shift()
        const numeros = []

        while (this.songs.length != numeros.length) {
            const shuffle = Math.floor(Math.random() * this.songs.length)
            if (!numeros.includes(shuffle)) {
                numeros.push(shuffle)
            }
        }

        this.songs = numeros.map(numero => this.songs[numero])
        this.songs.unshift(firstMusic)
        return this.setQueue()
    }

    async pause() {
        this.dispatcher.pause()
        this.songPlay = Date.now() - this.songPlay
        this.setQueue()
    }

    async resume() {
        this.dispatcher.unpause()
        this.songPlay = Date.now() - this.songPlay
        this.setQueue()
    }

    stop() {
        const { client } = this

        this.connection.destroy();
        this.message?.delete().catch(() => { })
        this.collector.stop()

        this.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('RED')
                    .setAuthor({ name: ' | ⏹️ Stopped Queue.', iconURL: client.user.displayAvatarURL() })
            ]
        }).catch(() => { })

        client.queues.delete(msg.guild.id)
    }

    skip() {
        if (this.loopingQueue)
            return this.playSong(this.songs[0])

        this.songs.shift()
        this.setQueue()
        return this.playSong(this.songs[0])
    }

    skipTo(position) {
        const musicSkip = this.songs[position]

        if (!musicSkip)
            throw new Error('A posição escolhida é invalida')

        if (this.loopingQueue)
            return this.playSong(this.songs[0]);

        this.backMusic()
        this.songs.splice(position - 1, 1)
        this.songs.unshift(musicSkip)
        this.setQueue()
        this.playSong(this.songs[0]);
    }

    joinChannelVoice() {
        const { member, guild } = this
        return joinVoiceChannel({
            channelId: member.voice.channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator
        });
    }

    addAndPlaySong(song) {
        if (this.songs.length) {
            this.songs.push(song)
            const { user, songs, cor } = this
            return this.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(cor)
                        .setAuthor({ name: `| 🎶 Adicionado a ${songs.length - 1}° posição da queue.`, iconURL: user.displayAvatarURL() })
                        .setDescription(`[${song.title}](${song.url}) [${song.durationFormatted}]`)
                ]
            })
        }

        this.songs.push(song)
        this.playSong(song)
    }

    embedSong(songNow) {
        return new MessageEmbed()
            .setColor(this.cor)
            .setDescription(`[${songNow.title}](${songNow.url}) [${songNow.durationFormatted}]`)
            .setAuthor({ name: `| 🎶 Tocando Agora`, iconURL: this.user.displayAvatarURL() })
    }

    getComponentsMessage() {
        const { looping, dispatcher } = this

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

        if (['playing', 'buffering'].includes(dispatcher._state.status)) {
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



        object2.components.unshift({
            "type": 2,
            "label": `${looping ? 'Loop: On' : 'Loop: Off'}`,
            "style": looping ? 3 : 4,
            "custom_id": "loop",
            "emoji": "♾️"
        })

        return [object, object2]
    }

    async sendMessage(song) {
        const embed = this.embedSong(song)
        const menu = this.getComponentsMessage()
        return this.channel.send({
            embeds: [embed],
            components: menu
        })
    }

    async playSong(song) {
        if (!song) return this.stop();

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        const stream = await play.stream(song.id)
        const resource = createAudioResource(stream.stream, { inputType: stream.type });

        if (!this.connection)
            this.connection = this.joinChannelVoice()

        if (this.loopingQueue && this.songs.length == 1)
            this.tocarPlaylist(this.loopingQueue)

        player.play(resource);
        this.connection.subscribe(player)
        this.dispatcher = player
        this.songPlay = Date.now()

        this.setQueue()

        if (this.message) this.message.delete().catch(() => { })
        if (this.collector) this.collector.stop()

        this.message = await this.sendMessage(song)

        this.menuMessage()

        player.on(AudioPlayerStatus.Idle, async () => {
            if (!this.loop) this.backMusic()
            this.message.delete().catch(() => { })
            this.playSong(this.songs[0])
        });

        player.on("error", e => {
            console.log(e)
            this.stop()
        });
    }

    menuMessage() {
        this.collector = this.message.createMessageComponentCollector({
            filter: i => i.member.voice.channel,
            componentType: 'BUTTON',
        });

        this.collector.on('collect', i => {
            const componentsMessage = () => this.getComponentsMessage()

            if (i.member.voice.channel != this.connection?.joinConfig.channelId) {
                const helpMsg = new MessageEmbed()
                    .setColor(this.cor)
                    .setAuthor({ name: `| ❌ Você precisa estar no mesmo canal de voz que eu!`, iconURL: i.user.displayAvatarURL() })
                return i.reply({ embeds: [helpMsg], ephemeral: true })
            }

            if (this.dispatcher._state.status == 'idle') return i.deferUpdate();

            const objects = {
                'pause': async () => {
                    await this.pause()
                    i.update({ components: componentsMessage() })
                },
                'resume': async () => {
                    await this.resume()
                    i.update({ components: componentsMessage() })
                },
                'queue': () => {
                    const quantidadeSongs = this.songs.length - 1 == 0 ? 1 : this.songs.length - 1
                    const pags = () => {
                        const total = this.songs.length - 1
                        return total < 10 ? 1 : Math.ceil((total / 10))
                    }
                    const songsString = () => {
                        const firstMusic = this.songs[0]
                        let string = `🔊 **Tocando agora**\n[${firstMusic.title}](${firstMusic.url})\n${this.musicVetor()}\n\n`
                        let string2 = this.songs.map((song, indice) => {
                            return `**${indice}.** [${song.title}](${song.url}) [${song.durationFormatted}]`
                        }).slice(1, 10).join("\n")
                        return string + string2
                    }

                    const somarDuration = () => {
                        const duration = this.songs.reduce((acc, song) => acc + song.duration, 0)
                        return duration / 1000
                    }

                    const helpMsg = new MessageEmbed()
                        .setColor(this.cor)
                        .setDescription(songsString())
                        .setAuthor({ name: `| 📑 Queue`, iconURL: i.user.displayAvatarURL() })
                        .setFooter({ text: `Músicas: ${quantidadeSongs} | Pag's: 1/${pags()} | Tempo: ${secondsToText(somarDuration())} ` })
                    return i.reply({ embeds: [helpMsg], ephemeral: true })

                },
                'skip': async () => {
                    await this.skip()
                    i.deferUpdate()
                },
                'shuffle': () => {
                    this.shuffle().then(() => {
                        return i.reply({
                            embeds: [
                                new MessageEmbed().
                                    setAuthor({ name: '| 🔀 Queue Embaralhada Com Sucesso.', iconURL: i.user.displayAvatarURL() }).
                                    setColor(this.cor)
                            ]
                            , ephemeral: true
                        })
                    }).catch(e => {
                        return i.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor(this.cor)
                                    .setAuthor({ name: `Error =>${e.message}`, iconURL: i.user.displayAvatarURL() })
                            ], ephemeral: true
                        })
                    })

                },
                'stop': () => {
                    i.deferUpdate()
                    this.stop()
                },
                'back': async () => {
                    if (!this.back) {
                        return i.reply({
                            embeds: [
                                new MessageEmbed().
                                    setAuthor({ name: '| Não existe música para voltar', iconURL: i.user.displayAvatarURL() }).
                                    setColor(this.cor)
                            ]
                            , ephemeral: true
                        })
                    }
                    this.playSong(this.back)
                    i.deferUpdate()
                },
                'loop': () => {
                    this.loop()
                    i.update({ components: componentsMessage() })
                }
            }

            try {
                objects[i.customId]()
            } catch (e) { }

        })






    }

    static async songSearch(songName) {
        const incluso = item => songName.toLowerCase().includes(item)
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
                        secondsToText(durationInSec)
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
                            secondsToText(durationInMs / 1000))
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
                        secondsToText(duration_ms / 1000)
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
                            secondsToText(duration_ms / 1000)
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
                            secondsToText(duration_ms / 1000)
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
                durationPlaylist: secondsToText(durationPlaylist / 1000),
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


}

module.exports = Queue