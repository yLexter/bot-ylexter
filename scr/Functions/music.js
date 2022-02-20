const { MessageEmbed } = require('discord.js');
const { getData, getTracks } = require('spotify-url-info');
const YouTube = require("youtube-sr").default;
const play = require('play-dl')
const {
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} = require('@discordjs/voice');

async function playSong(client, msg, song) {

  const { stopMusic, tocarPlaylist, backMusic } = client.music
  const cor = '#4B0082'
  let icone

  try {

    let queue = client.queues.get(msg.guild.id);

    if (msg.type == 'APPLICATION_COMMAND') {
      icone = msg.user.displayAvatarURL()
    } else {
      icone = msg.author.displayAvatarURL()
    }

    if (!song) return stopMusic(client, msg, cor);

    const url = song.url
    const player = createAudioPlayer();
    const stream = await play.stream(song.id)
    const resource = createAudioResource(stream.stream, { inputType: StreamType.Opus });

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
        loopQueue: null
      }

      client.queues.set(msg.guild.id, queue);
      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setDescription(`Duração: **${song.durationFormatted}**`)
        .setTitle(song.title)
        .setURL(url)
        .setAuthor({ name: `| 🎶 Tocando Agora`, iconURL: icone })
      msg.channel.send({ embeds: [helpMsg] })
    };

    if (queue.loopQueue && queue.songs.length == 1) tocarPlaylist(client, msg, queue.loopQueue);

    player.play(resource);
    queue.connection.subscribe(player)
    queue.dispatcher = player

    player.on(AudioPlayerStatus.Idle, () => {
      let queue = client.queues.get(msg.guild.id);
      if (!queue.loop) backMusic(client, msg)

      playSong(client, msg, queue.songs[0])
      if (queue.songs.length > 0) {
        let url = queue.songs[0].url
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setTitle(`${queue.songs[0].title}`)
          .setURL(url)
          .setAuthor({ name: `| 🎶 Tocando Agora`, iconURL: icone })
        msg.channel.send({ embeds: [helpMsg] })
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
    let queue = client.queues.get(msg.guild.id)
    if (queue) {
      if (queue.connection) queue.connection.destroy();
      client.queues.delete(msg.guild.id)
      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setAuthor({ name: ' | ⏹️ Stopped Queue.', iconURL: client.user.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] })
    }
  } catch (e) { return }
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

function secondsToText(segundos) {
  dia = Math.floor(segundos / 86400)
  restoDia = Math.floor(segundos % 86400)
  horas = Math.floor(restoDia / 3600)
  restoHoras = Math.floor(restoDia % 3600)
  minutos = Math.floor(restoHoras / 60)
  seconds = restoHoras % 60
  capsula = [dia, horas, minutos, seconds]

  let capsula2 = capsula.map(item => {
    return item < 10 ? item = `0${item}` : item
  })

  if (capsula2[0] == '00') capsula2.shift();
  if (capsula2[0] == '00') capsula2.shift();
  return capsula2.join(':')
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

async function textToSeconds(text) {

  async function formatar(y) {
    const ok = y.split(":").map(x => { return Number(x) })
    for (let number of ok) {
      if (isNaN(number)) throw new Error('Use Horas:Minutos:Segundos.');
    }
    if (ok[0] == '00') ok.shift()
    if (ok[0] == '00') ok.shift()
    return ok
  }

  const tempo = await formatar(text)
  const quantidade = tempo.length

  const objects = {
    '0': () => {
      return 0
    },

    '1': () => {
      const segundos = Math.abs(tempo[0])
      if (segundos > 59) throw new Error('Número Invalido')
      return segundos
    },

    '2': () => {
      const minutos = Math.abs(tempo[0])
      const segundos = Math.abs(tempo[1])
      if (segundos > 59 || minutos > 59) throw new Error('Número Invalido')
      return minutos * 60 + segundos
    },

    '3': () => {
      const horas = Math.abs(tempo[0])
      const minutos = Math.abs(tempo[1])
      const segundos = Math.abs(tempo[2])
      if (segundos > 59 || minutos > 59 || horas > 23) throw new Error('Número Invalido')
      return horas * 60 * 60 + minutos * 60 + segundos
    }
  }

  if (!objects[quantidade]) throw new Error('Só é permitido , Horas Minutos e Segundos.');
  return await Math.floor(objects[quantidade]())

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
        durationFormatted: secondsToText(duration_ms / 1000),
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
          durationFormatted: secondsToText(duration_ms / 1000),
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
        duration: secondsToText(durationTotal / 1000),
        images: images
      }
    },
    'album': async () => {

      const { name, external_urls, images, type, total_tracks, artists } = infoSpotify

      const resultado = spotify.map(x => {
        let titulo = `${x.name} - ${x.artists[0].name ? x.artists[0].name : ""}`
        return search_yt(titulo)
      });

      const artista = artists && artists.length > 0 ? artists.map((x,y,z) => {
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
          durationFormatted: secondsToText(duration_ms / 1000),
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
        duration: secondsToText(durationTotal / 1000),
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
    , "4K", "4k", "CLIPE", "Clipe", "dvd", "clipe"
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
      .setTitle(`${song.title}`)
      .setAuthor({ name: `| 🎶 Adicionado a Fila`, iconURL: msg.author.displayAvatarURL() })
      .setURL(song.url)
      .setDescription(`Duração: **${song.durationFormatted}**`)
    return msg.channel.send({ embeds: [helpMsg] })
  } else return playSong(client, msg, song);
}

module.exports = {
  vdSearch,
  ytPlaylist,
  stopMusic,
  tocarPlaylist,
  secondsToText,
  backMusic,
  textToSeconds,
  spotifySearch,
  playSong,
  titulo_formatado,
  PushAndPlaySong
}
