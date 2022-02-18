const { MessageEmbed } = require("discord.js");

module.exports = {
     name: "nowplaying",
     help: "Mostra música que está sendo tocada atualmente.",
     type: 'music',
     aliase: ['nwp'],
     execute: (client, msg, args, cor) => {

          const { stopMusic } = client.music

          try {
               const queue = client.queues.get(msg.member.guild.id)
          
               if (!queue) {
                    const helpMsg = new MessageEmbed()
                         .setColor(cor)
                         .setAuthor({name: `| ❌ Erro`, iconURL: msg.author.displayAvatarURL()})
                         .setDescription('Não existe músicas sendo tocada.')
                    return msg.channel.send({ embeds: [helpMsg] })
                  }

               const song = queue.songs[0]

               const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`[${song.title}](${song.url}) [${song.durationFormatted}]`)
                    .setAuthor({name: `| 🎶 Tocando Agora `, iconURL: msg.author.displayAvatarURL()})
               return msg.channel.send({ embeds: [helpMsg] })

          } catch (e) { stopMusic(client, msg , cor), msg.channel.send(`\`${e}\``) }
     }
}

