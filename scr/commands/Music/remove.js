const { MessageEmbed } = require("discord.js");
const wait = require('util').promisify(setTimeout);

module.exports = {
  name: "remove",
  help: "Remove uma música desejada da queue",
  type: 'music',
  usage: '<Comando> + <Posição da música> || Ex: remove 10, remove a 10° música.',
  aliase: [],
  execute: async (client, msg, args, cor) => {

    const { stopMusic } = client.music

    try {
      const queue = client.queues.get(msg.member.guild.id);
      const removeTo = Math.floor(Number(args[0]))

      if (!queue || removeTo == 0 || !queue.songs[removeTo]) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .addFields(
            { name: " Queue", value: "Não existe músicas tocando atualmente", inline: true },
            { name: "Parâmetro Inválido", value: "Nenhum parametro válido foi fornecido", inline: true})
          .setAuthor({ name: `| ❌ Possiveis Erros`, iconURL: msg.author.displayAvatarURL() })
        return msg.channel.send({ embeds: [helpMsg] })
      }

      const songRemovida = queue.songs[removeTo]
      queue.songs.splice(removeTo, 1)
      client.queues.set(msg.guild.id, queue)

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setDescription(`[${songRemovida.title}](${songRemovida.url}) [${songRemovida.durationFormatted}]`)
        .setAuthor({ name: `| ✔️ Removida:`, iconURL: msg.author.displayAvatarURL() })
      msg.channel.send({ embeds: [helpMsg] })

    } catch (e) { console.log(e), stopMusic(client, msg, cor) };

  }
}


