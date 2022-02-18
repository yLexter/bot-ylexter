const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "skipto",
  help: "	Pula para uma determinada música na fila de músicas",
  type: 'music',
  aliase: ['skt'],
  execute: (client, msg, args, cor) => {

    const { stopMusic, backMusic, playSong } = client.music

    try {
      let queue = client.queues.get(msg.guild.id);
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

      const principal10 = async () => {
        const firstMusic = queue.songs[skipTO]
        backMusic(client, msg)

        queue.songs.splice(skipTO - 1, 1)
        queue.songs.unshift(firstMusic)
        client.queues.set(msg.guild.id, queue)

        const song = queue.songs[0]

        playSong(client, msg, song);

        if (queue.songs.length > 0) {
          const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setDescription(`[${song.title}](${song.url}) [${song.durationFormatted}]`)
            .setAuthor({ name: `| ⏯️ Skipped `, iconURL: msg.author.displayAvatarURL() })
          return msg.channel.send({ embeds: [helpMsg] })
        } 
      }

      !queue.loop ? principal10() : playSong(client, msg, queue.songs[0])

    } catch (e) { stopMusic(client, msg, cor), msg.channel.send(`\`${e}\``) }
  }

}


