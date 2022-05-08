const { MessageEmbed } = require("discord.js");

module.exports = {
     name: "clear",
     help: "Limpa todas as musicas da queue",
     type: 'music',
     aliase: ["cl"],
     execute: (client, msg, args, cor) => {

          const { stop } = client.music

          try {

               const queue = client.queues.get(msg.guild.id);

               if (!queue) {
                    const helpMsg = new MessageEmbed()
                         .setColor(cor)
                         .setAuthor({ name: `| Não existe Músicas sendo Tocada.`, iconURL: msg.author.displayAvatarURL() })
                    return msg.channel.send({ embeds: [helpMsg] })
               }

               queue.songs = [queue.songs[0]];
               client.queues.set(msg.guild.id, queue);

               const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ✔️ Queue Limpa.`, iconURL: msg.author.displayAvatarURL() })
               return msg.channel.send({ embeds: [helpMsg] })

          } catch (e) { stop(client, msg), msg.channel.send(`\`${e}\``) }
     }
};

