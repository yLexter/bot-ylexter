const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "skipto",
  help: "	Pula para uma determinada música na fila de músicas",
  type: 'music',
  usage: '<Comando> + <Posição da música> || Ex: skipto 10 , Skipa para 10° música.',
  aliase: ['skt'],
  execute: (client, msg, args, cor) => {

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


