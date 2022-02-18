const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "loop",
  help: "Deixa a música atual em looping",
  type: 'music',
  aliase: ["lp"],
  execute: (client, msg, args, cor) => {

    const { stopMusic } = client.music

    try {

      const queue = client.queues.get(msg.guild.id);

      if (!queue) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setTitle('**Erro:**')
          .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
          .setDescription('Não existe músicas sendo tocada.')
        return msg.channel.send({ embeds: [helpMsg] })
      }

      var looping = !queue.loop ? true : false;
      var setlooping = looping ? queue.loop = true : queue.loop = null;
      var loopingatual = queue.loop ? 'Ativado.' : 'Desativado.'
      client.queues.set(msg.guild.id, queue);

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setAuthor({ name: `| ♾️ Loop ${loopingatual} `, iconURL: msg.author.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] })


    } catch (e) { stopMusic(client, msg , cor), msg.channel.send(`\`${e}\``) }

  }

};




