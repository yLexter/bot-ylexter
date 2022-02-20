const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "resume",
  help: "Volta a tocar a música pausada.",
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

      if (queue.dispatcher._state.status == 'playing') return msg.delete().catch(() => { });

      queue.dispatcher.unpause();

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setAuthor({ name: '| ▶️ Voltando a Tocar.', iconURL: msg.author.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] })


    } catch (e) { stopMusic(client, msg, cor), msg.channel.send(`\`${e}\``) }
  }
}; // Execute end
