const { MessageEmbed } = require("discord.js");
const Command = require('../../classes/command')

class CommandLoopQueue extends Command {
  constructor() {
    super({
      name: "loopqueue",
      help: "Deixa a queue atual em looping",
      type: 'music',
      aliase: ["lpq"],
    })
  }

  async execute(client, msg, args) {

    const { cor } = client
    const { stop } = client.music

    try {
      const queue = client.queues.get(msg.guild.id);
      if (!queue || queue.songs.length == 1) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| ❌ Erro`, iconURL: msg.author.displayAvatarURL() })
          .setDescription('Não existe músicas sendo tocada ou só existe uma música na queue')
        return msg.channel.send({ embeds: [helpMsg] })
      }

      const queueSaved = []
      for (let x of queue.songs) {
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
    } catch (e) { stop(client, msg), msg.channel.send(`\`${e}\``) }
  }
}

module.exports = CommandLoopQueue
