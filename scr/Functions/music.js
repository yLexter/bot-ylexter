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

async function soundCloudSearch(client, msg, item) {
  const data = await play.soundcloud(item)
  const { type, name, url, durationInMs, durationInSec, user, tracksCount } = data
  const typesData = {
    'track': () => {
      return {
        id: url,
        title: name,
        url: item,
        type,
        duration: durationInMs,
        durationFormatted: Utils.secondsToText(durationInSec)
      }
    },
    'playlist': async () => {
      const tracks = await data.all_tracks()
      console.log(tracks)

      const songs = tracks.map(song => {
        const { id, name, durationInMs } = song
        return {
          id: `https://api.soundcloud.com/tracks/${id}`,
          title: name || '??',
          url: item,
          duration: durationInMs || 0,
          durationFormatted: durationInMs ? Utils.secondsToText(durationInMs / 1000) : '00:00'
        }
      })
      return {
        type,
        owner: {
          name: user.name,
          url: user.url
        },
        playlist: {
          name,
          url: item,
        },
        songs,
        total: tracksCount,
        totalDuration: Utils.secondsToText(durationInSec)
      }
    }
  }
  return typesData[type]()
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
  try {
    function videosInject(x) {
      const queue = client.queues.get(msg.guild.id);
      x.forEach((elemento, indice) => {
        queue.songs.push(elemento)
      })
      client.queues.set(msg.guild.id, queue)
    }

    const queue = client.queues.get(msg.guild.id);
    const song = item[0]

    if (queue) {
      videosInject(item)
    } else {
      await playSong(client, msg, song)
      videosInject(item)
      const queue = client.queues.get(msg.guild.id);
      queue.songs.shift()
      client.queues.set(msg.guild.id, queue)
    }
  } catch (e) { return }
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

async function spotifySearch(client, msg, list) {

  async function search_yt(msc) {
    const result = await YouTube.search(msc, { limit: 3 })
    return result[0] ? result[0] : null
  };

  const spotify = await getTracks(list)
  const infoSpotify = await getData(list)

  const spotifyTypes = {
    'track': async () => {
      let titulo = `${spotify[0].name} - ${spotify[0].artists[0].name}`
      let msc = await search_yt(titulo)
      if (!msc) throw new Error('Música não Encontrada.');
      const { name, external_urls, duration_ms } = spotify[0]
      return {
        title: name,
        type: 'track',
        url: external_urls.spotify,
        durationFormatted: Utils.secondsToText(duration_ms / 1000),
        id: msc.id,
        duration: duration_ms
      }
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
        return {
          title: name,
          url: external_urls.spotify,
          durationFormatted: Utils.secondsToText(duration_ms / 1000),
          duration: duration_ms,
          id: result_final[y].id
        }
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

      const { name, external_urls, images, type, total_tracks, artists } = infoSpotify

      const resultado = spotify.map(x => {
        let titulo = `${x.name} - ${x.artists[0].name ? x.artists[0].name : ""}`
        return search_yt(titulo)
      });

      const artista = artists && artists.length > 0 ? artists.map((x, y, z) => {
        return z.length - 1 == y ? `[${x.name}](${x.external_urls.spotify})` : `[${x.name}](${x.external_urls.spotify}), `
      }) : '??'

      let resultSongsYt = await Promise.all(resultado)
      let durationTotal = 0

      const songs = spotify.map((x, y) => {
        const { name, external_urls, duration_ms } = spotify[y]
        durationTotal += duration_ms
        return {
          title: name,
          url: external_urls.spotify,
          durationFormatted: Utils.secondsToText(duration_ms / 1000),
          duration: duration_ms,
          id: resultSongsYt[y].id
        }
      })

      return {
        artista,
        name,
        type,
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

async function vdSearch(client, msg, item) {

  if (item.includes('youtube.com/watch?')) {
    var song = await YouTube.getVideo(item)
  } else {
    const busca = await YouTube.search(item, { limit: 3 })
    var song = busca[0]
    if (busca && busca.length == 0) {
      throw new Error('Música não encontrada')
    }
  }

  const { id, url, duration, durationFormatted, title } = song

  return {
    id: id,
    title: title,
    url: url,
    duration: duration,
    durationFormatted: durationFormatted,
  }

}

async function ytPlaylist(client, msg, item) {

  const formatar = item.split("list=")
  let idPlaylist = formatar[1]
  let stringIndex = '&index'

  if (idPlaylist.includes(stringIndex)) {
    let formatar2 = idPlaylist.split(stringIndex)
    idPlaylist = formatar2[0]
  }

  item = `https://www.youtube.com/playlist?list=${idPlaylist}`

  const lista1 = await YouTube.getPlaylist(item)
  const lista2 = await lista1.fetch()

  const songs = lista2.videos.map(x => {
    const { id, url, duration, durationFormatted, title } = x
    return {
      id: id,
      title: title,
      url: url,
      duration: duration,
      durationFormatted: durationFormatted,
    }
  })

  const { title, videoCount, views, channel, url } = lista2

  let string = 0
  for (drt of songs) {
    string += drt.duration
  }

  return {
    title: title,
    videoCount: videoCount,
    views: views,
    channel: channel,
    url: url,
    songs: songs,
    total: string
  }

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
  const barraMusic = []
  const emoji = '🔵'
  const maxBarrinha = 10
  const queue = client.queues.get(msg.guild.id)

  for (let x = 0; x < maxBarrinha; x++) {
    barraMusic.push("▬")
  }

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
  vdSearch,
  ytPlaylist,
  stopMusic,
  tocarPlaylist,
  backMusic,
  spotifySearch,
  playSong,
  titulo_formatado,
  PushAndPlaySong,
  musicVetor,
  soundCloudSearch
}
