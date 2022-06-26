const { MessageEmbed } = require("discord.js");

const Command = require('../../classes/command')

class CommandBack extends Command {
  constructor() {
    super({
      name: "back",
      help: "Volta a tocar a música anterior",
      type: 'music',
      aliase: [],
    })
  }

  async execute(client, msg, args) {

    const { cor } = client
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
}

module.exports = CommandBack

