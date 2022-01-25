
module.exports = {
  name: "queue",
  help: "Mostra as músicas da fila",
  type: 'music',
  aliase: [],
  execute: async (client, msg, args, cor) => {

    const { MessageEmbed } = require("discord.js");
    const { secondsToText } = client.music

    try {
      const queue = client.queues.get(msg.member.guild.id);

      if (!queue || queue.songs.length == 0) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
          .setDescription('Não existe músicas sendo tocada.')
        return msg.channel.send({ embeds: [helpMsg] })
      }

      const { songs, loop } = queue

      let string = `🔊 **Tocando agora**\n[${songs[0].title}](${ songs[0].url }) [${songs[0].durationFormatted}]\n\n`
      let string2 = 0
      var pags = songs.length < 11 ? 1 : Math.floor((songs.length / 10))

      for (i = 1; i < songs.length; i++) {
        string += `**${i}**. [${songs[i].title}](${songs[i].url}) [${songs[i].durationFormatted}]\n`
        if (i == 10) break;
      }

      for (msc of songs) {
        string2 += msc.duration
      };

      string += `\nTotal: ${songs.length - 1} | Pag's: 1/${pags} | Tempo: ${secondsToText(string2 / 1000)}`

      const helpMsg10 = new MessageEmbed()
        .setColor(cor)
        .setDescription(string)
        .setAuthor({ name: `| 📑 Queue`, iconURL: msg.author.displayAvatarURL() })
      msg.channel.send({ embeds: [helpMsg10] })

    } catch (e) { msg.channel.send(`\`${e}\``) }
  }



}
















