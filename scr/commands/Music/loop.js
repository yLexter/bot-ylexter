const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "loop",
  help: "Deixa a música atual em looping",
  type: 'music',
  aliase: ["lp"],
  execute: (client, msg, args, cor) => {

    const { stop, loop } = client.music

    try {

      const queue = client.queues.get(msg.guild.id);

      if (!queue) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| Não existe Músicas sendo Tocada. `, iconURL: msg.author.displayAvatarURL() })
        return msg.channel.send({ embeds: [helpMsg] })
      }

      const looping = loop(client, msg)
      const loopingatual = looping ? 'Ativado.' : 'Desativado.'

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setAuthor({ name: `| ♾️ Loop ${loopingatual} `, iconURL: msg.author.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] })


    } catch (e) { stop(client, msg), msg.channel.send(`\`${e}\``) }

  }

};




