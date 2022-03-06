const { MessageEmbed } = require("discord.js");

module.exports = {
     name: "nowplaying",
     help: "Mostra música que está sendo tocada atualmente.",
     type: 'music',
     aliase: ['nwp'],
     execute: (client, msg, args, cor) => {

          const { stopMusic , secondsToText } = client.music

          try {
               const queue = client.queues.get(msg.member.guild.id)
               const barraMusic = []
               const emoji = '🔵'
               const maxBarrinha = 10

               for (let x = 0; x < maxBarrinha; x++) {
                    barraMusic.push("-")
               }

               if (!queue) {
                    const helpMsg = new MessageEmbed()
                         .setColor(cor)
                         .setAuthor({ name: `| Não existe Músicas sendo Tocada.`, iconURL: msg.author.displayAvatarURL() })
                    return msg.channel.send({ embeds: [helpMsg] })
               }

               const songPaused = queue.dispatcher._state.status == 'paused'
               const song = queue.songs[0]
               const time = songPaused ? Math.floor(queue.songPlay / 1000) : Math.floor((Date.now() - queue.songPlay) / 1000)
               const timeFormatado = secondsToText(time)
               const positionBola = Math.floor(time / (song.duration / (1000 * barraMusic.length)))

               barraMusic.splice(positionBola, 0, emoji)

               const stringBarra = barraMusic.join("")
               const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`[${song.title}](${song.url}) \n\n**⏯️ [${timeFormatado}] ${stringBarra} [${song.durationFormatted}]**`)
                    .setAuthor({ name: `| 🎶 Tocando Agora `, iconURL: msg.author.displayAvatarURL() })
               return msg.channel.send({ embeds: [helpMsg] })

          } catch (e) { stopMusic(client, msg, cor), msg.channel.send(`\`${e}\``) }
     }
}

