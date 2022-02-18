const { MessageEmbed } = require("discord.js");

module.exports = {
     name: "clear",
     help: "Limpa todas as musicas da queue",
     type: 'music',
     aliase: ["c"],
     execute: (client, msg, args, cor) => {

          const { stopMusic } = client.music

          try {

               const queue = client.queues.get(msg.guild.id);

               if (!queue) {
                    const helpMsg = new MessageEmbed()
                         .setColor(cor)
                         .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
                         .setDescription('Não existe músicas sendo tocada.')
                    return msg.channel.send({ embeds: [helpMsg] })
               }

               const firstMusic = queue.songs[0]
               queue.songs = [];
               queue.songs.push(firstMusic)
               client.queues.set(msg.guild.id, queue);

               const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ✔️ Queue Limpa.`, iconURL: msg.author.displayAvatarURL() })
               return msg.channel.send({ embeds: [helpMsg] })

          } catch (e) { stopMusic(client, msg , cor), msg.channel.send(`\`${e}\``) }
     }
};

