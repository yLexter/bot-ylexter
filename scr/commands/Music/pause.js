const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "pause",
  help: "Pausa a música atual",
  type: 'music',
  aliase: [],
  execute: (client, msg, args, cor) => {

    const { stopMusic } = client.music

    try {

      const queue = client.queues.get(msg.guild.id);

      if (!queue) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| Não existe Músicas sendo Tocada. `, iconURL: msg.author.displayAvatarURL() })
        return msg.channel.send({ embeds: [helpMsg] })
      }

      if (queue.dispatcher._state.status == 'paused') return msg.delete().catch(() => { });
      
      queue.dispatcher.pause()
      queue.songPlay = Date.now() - queue.songPlay
      client.queues.set(msg.guild.id, queue);

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setAuthor({ name: '| ⏹️ Pausada.', iconURL: msg.author.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] })


    } catch (e) { stopMusic(client, msg, cor), msg.channel.send(`\`${e}\``) }
  }
}; // Execute end
