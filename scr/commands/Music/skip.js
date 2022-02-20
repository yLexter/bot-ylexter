const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "skip",
  help: "Pula para a proxima música.",
  type: 'music',
  aliase: ["sk"],
  execute: (client, msg, args, cor) => {

    const { stopMusic, backMusic, playSong } = client.music

    try {

      const queue = client.queues.get(msg.guild.id);

      if (!queue) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| Não existe Músicas sendo Tocada.`, iconURL: msg.author.displayAvatarURL() })
        return msg.channel.send({ embeds: [helpMsg] })
      }

      if (!queue.loop) backMusic(client, msg), client.queues.set(msg.guild.id, queue);
      const song = queue.songs[0]
      playSong(client, msg, song);

      if (queue.songs.length > 0) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setDescription(`[${song.title}](${song.url}) [${song.durationFormatted}]`)
          .setAuthor({ name: `| ⏯️ Skipped `, iconURL: msg.author.displayAvatarURL() })
        return msg.channel.send({ embeds: [helpMsg] })
      }

    } catch (e) { stopMusic(client, msg, cor), msg.channel.send(`\`${e}\``) }
  }
};




