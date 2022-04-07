const { MessageEmbed } = require('discord.js');
const { getData, getTracks } = require('spotify-url-info');
const YouTube = require("youtube-sr").default;
const Utils = require("./Utils")
const play = require('play-dl')
const {
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} = require('@discordjs/voice');


async function songSearch(client, msg, songName) {
  const incluso = item => { return songName.toLowerCase().includes(item) }
  const spTify = incluso('spotify.com')
  const sdCloud = incluso('soundcloud.')
  const ytPlaylist = incluso('list=')

  return spTify ? await spotifySearch() : sdCloud ? await soundCloudSearch() : ytPlaylist ? await ytPlaylistSearch() : await ytVideoSearch()

  async function soundCloudSearch() {
    const data = await play.soundcloud(songName)
    const { type, name, url, durationInMs, durationInSec, user, tracksCount } = data
    const typesData = {
      'track': () => {
        return newSong(url, name, songName, durationInMs, Utils.secondsToText(durationInSec))
      },
      'playlist': async () => {
        const songs = (await data.all_tracks()).map(song => {
          const { id, name, durationInMs } = song
          return newSong(`https://api.soundcloud.com/tracks/${id}`, name, songName, durationInMs, Utils.secondsToText(durationInMs / 1000))
        })
        return {
          type,
          owner: {
            name: user.name,
            url: user.url
          },
          playlist: {
            name,
            url: songName,
          },
          songs,
          total: tracksCount,
          totalDuration: Utils.secondsToText(durationInSec)
        }
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
    return newSong(id, title, url, duration, durationFormatted)

  }

  async function ytPlaylistSearch() {

    const playlist = await play.playlist_info(songName)
    const msgError = '??'

    const songs = playlist.videos.map(x => {
      const { id, url, title, durationRaw, durationInSec } = x
      return newSong(id, title, url, durationInSec * 1000, durationRaw)
    })

    const { type, title, channel, url } = playlist

    let string = 0
    for (drt of songs) {
      string += drt.duration
    }

    return {
      type,
      owner: {
        name: channel.name || msgError,
        url: channel.url || msgError
      },
      playlist: {
        name: title,
        url
      },
      total: string,
      videoCount: songs.length,
      songs: songs,
    }

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
        return newSong(msc.id, name, external_urls.spotify, duration_ms, Utils.secondsToText(duration_ms / 1000))
      },
      'playlist': async () => {
        const { owner, external_urls, followers, tracks, images, name, type } = infoSpotify
        const resultado = spotify.map(x => {
          let titulo = `${x.name} - ${x.artists[0].name}`
          return search_yt(titulo)
        });

        let result_final = await Promise.all(resultado)
        let durationTotal = 0

        const songs = spotify.map((x, y) => {
          const { name, external_urls, duration_ms } = spotify[y]
          durationTotal += duration_ms
          return newSong(result_final[y].id, name, external_urls.spotify, duration_ms, Utils.secondsToText(duration_ms / 1000))
        })

        return {
          playlist: {
            name: name,
            url: external_urls.spotify
          },
          owner: {
            name: owner.display_name,
            url: external_urls.spotify
          },
          songs: songs,
          type: type,
          likes: followers.total,
          total: tracks.total,
          duration: Utils.secondsToText(durationTotal / 1000),
          images: images
        }

      },
      'album': async () => {
        const { name, external_urls, images, total_tracks, artists } = infoSpotify
        console.log(infoSpotify)
        const resultado = spotify.map(x => {
          let titulo = `${x.name} - ${x.artists[0].name ? x.artists[0].name : ""}`
          return search_yt(titulo)
        });

        const artista = artists && artists.length > 0 ? artists.map(x => { return `[${x.name}](${x.external_urls.spotify})` }).join(", ") : '??'

        let resultSongsYt = await Promise.all(resultado)
        let durationTotal = 0

        const songs = spotify.map((x, y) => {
          const { name, external_urls, duration_ms } = spotify[y]
          durationTotal += duration_ms
          return newSong(resultSongsYt[y].id, name, external_urls.spotify, duration_ms, Utils.secondsToText(duration_ms / 1000))
        })

        return {
          artista,
          name,
          type: 'album',
          total: total_tracks,
          url: external_urls.spotify,
          images,
          songs,
          duration: Utils.secondsToText(durationTotal / 1000),
        }
      }
    }

    return spotifyTypes[infoSpotify.type]()

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

async function playSong(client, msg, song) {

  const { stopMusic, tocarPlaylist, backMusic } = client.music
  const cor = process.env.COR
  let icone

  try {

    let queue = client.queues.get(msg.guild.id);

    if (msg.type == 'APPLICATION_COMMAND') {
      icone = msg.user.displayAvatarURL()
    } else {
      icone = msg.author.displayAvatarURL()
    }

    const embedNowPlay = (songNow) => {
      return new MessageEmbed()
        .setColor(cor)
        .setDescription(`[${songNow.title}](${songNow.url}) [${songNow.durationFormatted}]`)
        .setAuthor({ name: `| 🎶 Tocando Agora`, iconURL: icone })
    }

    if (!song) return stopMusic(client, msg, cor);

    const player = createAudioPlayer();
    const stream = await play.stream(song.id)
    const resource = createAudioResource(stream.stream, { inputType: stream.type });

    if (!queue) {
      var conn = await joinVoiceChannel({
        channelId: msg.member.voice.channel.id,
        guildId: msg.guild.id,
        adapterCreator: msg.guild.voiceAdapterCreator
      });
      queue = {
        volume: 0.2,
        connection: conn,
        dispatcher: null,
        songs: [song],
        loop: null,
        back: null,
        loopQueue: null,
        songPlay: null,
        message: null
      }
      queue.message = await msg.channel.send({ embeds: [embedNowPlay(song)] })
      client.queues.set(msg.guild.id, queue);
    };

    if (queue.loopQueue && queue.songs.length == 1) tocarPlaylist(client, msg, queue.loopQueue);

    player.play(resource);
    queue.connection.subscribe(player)
    queue.dispatcher = player
    queue.songPlay = Date.now()

    player.on(AudioPlayerStatus.Idle, async () => {
      let queue = client.queues.get(msg.guild.id);
      if (!queue.loop) backMusic(client, msg)

      const nextSong = queue?.songs[0]
      queue.message.delete().catch(() => { })

      playSong(client, msg, nextSong)
      if (queue.songs.length > 0) {
        queue.message = await msg.channel.send({ embeds: [embedNowPlay(nextSong)] })
        client.queues.set(msg.guild.id, queue);
      }
    });

    player.on("error", (e) => {
      console.log(e)
      stopMusic(client, msg, cor)
    });

    client.queues.set(msg.guild.id, queue);

  } catch (e) {
    console.log(e)
    stopMusic(client, msg, cor)
  }

};

function stopMusic(client, msg, cor) {
  try {
    const queue = client.queues.get(msg.guild.id)
    if (queue) {
      if (queue.connection) queue.connection.destroy();
      client.queues.delete(msg.guild.id)
      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setAuthor({ name: ' | ⏹️ Stopped Queue.', iconURL: client.user.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] }).catch(() => { })
    }
  } catch (e) { return client.queues.delete(msg.guild.id), console.log(e) }
}

async function tocarPlaylist(client, msg, item) {

  let queue = client.queues.get(msg.guild.id);

  function videosInject(playlist) {
    playlist.forEach(song => { queue.songs.push(song) })
    client.queues.set(msg.guild.id, queue)
  }

  if (queue) return videosInject(item);

  await playSong(client, msg, item[0])
  queue = client.queues.get(msg.guild.id)
  videosInject(item)
  queue.songs.shift()
  client.queues.set(msg.guild.id, queue)

}

function backMusic(client, msg) {
  try {
    let queue = client.queues.get(msg.member.guild.id)
    if (queue) {
      const saved = queue.songs.shift()
      queue.back = saved
      client.queues.set(msg.member.guild.id, queue);
      return saved
    }
  } catch (e) { return }
}

function titulo_formatado(string) {
  let remover = ["Oficial", "oficial", '[', ']'
    , '(', ')', "Music", 'music',
    "Official", "Video", "Soundtrack",
    "Vídeo", "Clipe", "Lyric", "Lyrics", "VIDEO"
    , "VÍDEO", 'MUSIC', 'OFFICIAL', 'OFICIAL', "Audio", "AUDIO", "Áudio"
    , "4K", "4k", "CLIPE", "Clipe", "dvd", "clipe", "DVD", "Dvd"
  ]

  for (x of remover) {
    let formated = string.replaceAll(x, "")
    string = formated
  }
  return string
}

function PushAndPlaySong(client, msg, cor, song) {
  const queue = client.queues.get(msg.guild.id);
  if (queue) {
    queue.songs.push(song);
    client.queues.set(msg.guild.id, queue);
    const helpMsg = new MessageEmbed()
      .setColor(cor)
      .setAuthor({ name: `| 🎶 Adicionado a ${queue.songs.length - 1}° posição da queue.`, iconURL: msg.author.displayAvatarURL() })
      .setDescription(`[${song.title}](${song.url}) [${song.durationFormatted}]`)
    return msg.channel.send({ embeds: [helpMsg] })
  } else return playSong(client, msg, song);
}

function musicVetor(client, msg) {
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

module.exports = {
  songSearch,
  stopMusic,
  tocarPlaylist,
  backMusic,
  playSong,
  titulo_formatado,
  PushAndPlaySong,
  musicVetor,
}
