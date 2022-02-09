

module.exports = {
  name: "remove",
  help: "Remove uma música desejada da queue",
  type: 'music',
  aliase: [],
  execute: async (client, msg, args, cor) => {

    const { MessageEmbed } = require("discord.js");
    const { stopMusic } = client.music
    const wait = require('util').promisify(setTimeout);

    try {
      const queue = client.queues.get(msg.member.guild.id);
      const removeTo = Math.floor(Number(args[0]))

      if (!queue || !removeTo) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .addFields(
            { name: " Queue:", value: "`Não existe músicas tocando atualmente`" },
            { name: "Parâmetro Vazio", value: "`Nenhum parametro foi fornecido`" })
          .setAuthor({ name: `| ❌ Possiveis Erros: `, iconURL: msg.author.displayAvatarURL() })
       return msg.channel.send({ embeds: [helpMsg] })
      }

      const songRemovida = queue.songs[removeTo]

      if (!songRemovida || removeTo == 0) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .addFields(
            { name: "Parâmetro Invalido", value: "`Nenhum parametro válido foi fornecido`" })
          .setAuthor({ name: `| ❌ Possiveis Erros: `, iconURL: msg.author.displayAvatarURL() })
       return msg.channel.send({ embeds: [helpMsg] })
      }

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


