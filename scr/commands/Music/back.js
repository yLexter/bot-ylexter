const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "back",
  help: "Volta a tocar a música anterior",
  type: 'music',
  aliase: [],
  execute: (client, msg, args, cor) => {

    const { stop, back } = client.music

    try {

      const queue = client.queues.get(msg.guild.id);

      if (!queue || !queue.back) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| ❌ Não Existe músicas para voltar.`, iconURL: msg.author.displayAvatarURL() })
        return msg.channel.send({ embeds: [helpMsg] })
      }

      back(client, msg)

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setDescription(`[${song.title}](${song.url}) [${song.durationFormatted}]`)
        .setAuthor({ name: '| ⏪ Retornada', iconURL: msg.author.displayAvatarURL() })
      return msg.channel.send({ embeds: [helpMsg] })


    } catch (e) { stop(client, msg, cor), msg.channel.send(`\`${e}\``) }
  }
}; // Execute end

