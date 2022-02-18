const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "loopqueue",
  help: "Deixa a queue atual em looping",
  type: 'music',
  aliase: ["lpq"],
  execute: (client, msg, args, cor) => {

    const { stopMusic } = client.music

    try {
      const queue = client.queues.get(msg.guild.id);
      if (!queue || queue.songs.length == 1) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
          .setDescription('Não existe músicas sendo tocada ou só existe uma música na queue')
        return msg.channel.send({ embeds: [helpMsg] })
      }

      const queueSaved = []
      for (x of queue.songs) {
        queueSaved.push(x)
      }

      var looping = !queue.loopQueue ? true : false;
      looping ? queue.loopQueue = queueSaved : queue.loopQueue = null;
      var loopingatual = queue.loopQueue ? 'Ativado.' : 'Desativado.'
      client.queues.set(msg.member.guild.id, queue);

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setAuthor({ name: `| ♾️ LoopQueue ${loopingatual} `, iconURL: msg.author.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] })
    } catch (e) { stopMusic(client, msg, cor), msg.channel.send(`\`${e}\``) }
  }
};
