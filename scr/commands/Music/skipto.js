const { MessageEmbed } = require("discord.js");
const Command = require('../../classes/command')

class CommandSkipTo extends Command {
  constructor() {
    super({
      name: "skipto",
      help: "	Pula para uma determinada música na fila de músicas",
      type: 'music',
      usage: '<Comando> + <Posição da música> || Ex: skipto 10 , Skipa para 10° música.',
      aliase: ['skt'],
    })
  }

  async execute(client, msg, args) {

    const { cor } = client
    const { stop, skipTo } = client.music

    try {
      const queue = client.queues.get(msg.guild.id);
      const skipTO = Math.floor(Number(args[0]))

      if (!queue || skipTO <= 1 || !queue.songs[skipTO]) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .addFields(
            { name: " Queue", value: "Não existe músicas tocando atualmente", inline: true },
            { name: "Parâmetro Inválido", value: "Nenhum parametro válido foi fornecido", inline: true })
          .setAuthor({ name: `| ❌ Possiveis Erros`, iconURL: msg.author.displayAvatarURL() })
        return msg.channel.send({ embeds: [helpMsg] })
      }

      skipTo(client, msg, skipTO)

    } catch (e) { stop(client, msg, cor), msg.channel.send(`\`${e}\``) }

  }
}

module.exports = CommandSkipTo





