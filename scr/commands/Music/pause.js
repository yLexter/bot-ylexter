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
          .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
          .setDescription('Não existe músicas para Pausar.')
        return msg.channel.send({ embeds: [helpMsg] })
      }

      if(queue.dispatcher._state.status == 'paused') return msg.delete().catch(() => {});

      queue.dispatcher.pause()

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setAuthor({ name: '| ⏹️ Pausada.', iconURL: msg.author.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] })


    } catch (e) { stopMusic(client, msg , cor), msg.channel.send(`\`${e}\``) }
  }
}; // Execute end
