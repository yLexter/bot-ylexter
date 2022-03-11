const { MessageEmbed } = require("discord.js");

module.exports = {
     name: "nowplaying",
     help: "Mostra música que está sendo tocada atualmente.",
     type: 'music',
     aliase: ['nwp'],
     execute: (client, msg, args, cor) => {

          const { stopMusic, musicVetor } = client.music

          try {
               const queue = client.queues.get(msg.member.guild.id)
               const song = queue?.songs[0]

               if (!queue) {
                    const helpMsg = new MessageEmbed()
                         .setColor(cor)
                         .setAuthor({ name: `| Não existe Músicas sendo Tocada.`, iconURL: msg.author.displayAvatarURL() })
                    return msg.channel.send({ embeds: [helpMsg] })
               }


               const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`[${song.title}](${song.url})\n${musicVetor(client, msg)}`)
                    .setAuthor({ name: `| 🎶 Tocando Agora `, iconURL: msg.author.displayAvatarURL() })
               return msg.channel.send({ embeds: [helpMsg] })

          } catch (e) { stopMusic(client, msg, cor), msg.channel.send(`\`${e}\``) }
     }
}

