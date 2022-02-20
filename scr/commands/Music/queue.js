const { MessageEmbed } = require("discord.js");
const wait = require('util').promisify(setTimeout);

module.exports = {
  name: "queue",
  help: "Mostra as músicas da fila",
  type: 'music',
  aliase: [],
  execute: async (client, msg, args, cor) => {

    const { secondsToText } = client.music

    try {
      const queue = client.queues.get(msg.member.guild.id);

      if (!queue || queue.songs.length == 0) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| Não existe Músicas sendo Tocada. `, iconURL: msg.author.displayAvatarURL() })
        return msg.channel.send({ embeds: [helpMsg] })
      }

      let quantidadePerPag = 10
      const pagsTotal = total_pags()
      let paginaAtual = 1
      const finishCommmand = 300
      let msg_principal = await msg.channel.send({ embeds: [msgEmbed(paginaAtual, pagsTotal)] })

      function queuePags(number) {
        const queue = client.queues.get(msg.guild.id);
        const { songs } = queue
        let string = `🔊 **Tocando agora**\n[${songs[0].title}](${songs[0].url}) [${songs[0].durationFormatted}]\n\n`
        let pagAtual = number == 1 ? 1 : number * quantidadePerPag - quantidadePerPag + 1
        for (i = pagAtual; i < pagAtual + quantidadePerPag; i++) {
          if (!songs[i]) break;
          string += `**${i}**. [${songs[i].title}](${songs[i].url}) [${songs[i].durationFormatted}]\n`
        }
        return string
      }

      function total_pags() {
        const queue = client.queues.get(msg.guild.id);
        const total = queue.songs.length - 1
        return total < quantidadePerPag ? 1 : Math.ceil((total / quantidadePerPag))
      }

      function somarDuration() {
        const queue = client.queues.get(msg.guild.id);
        let string = 0
        for (msc of queue.songs) {
          string += msc.duration
        };
        return string / 1000
      }

      function msgEmbed(positon, pags) {
        const queue = client.queues.get(msg.guild.id);
        const quantidadeSongs = queue.songs.length - 1 == 0 ? 1 : queue.songs.length - 1
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setDescription(queuePags(positon))
          .setAuthor({ name: `| 📑 Queue`, iconURL: msg.author.displayAvatarURL() })
          .setFooter({ text: `Músicas: ${quantidadeSongs} | Pag's: ${paginaAtual}/${pags} | Tempo: ${secondsToText(somarDuration())}` })
        return helpMsg
      }

      function mudarMsg(number, pagsTotal) {
        return msg_principal.edit({ embeds: [msgEmbed(number, pagsTotal)] }).catch(() => { })
      }

      await msg_principal.react('⏪');
      await msg_principal.react('🔁');
      await msg_principal.react('⏩');

      const filter = (reaction, user) => {
        return (reaction.emoji.name == '⏪' || reaction.emoji.name == '🔁' || reaction.emoji.name == '⏩') && user.id == msg.author.id
      };

      const collector = await msg_principal.createReactionCollector({ filter, time: finishCommmand * 1000 });

      collector.on('collect', async (reaction, user) => {
        try {
          const queue = client.queues.get(msg.guild.id);

          if (!queue || queue.songs.length == 0) return collector.stop();

          const pagsTotal = total_pags()

          function firstPag() {
            paginaAtual = 1
            return mudarMsg(paginaAtual, pagsTotal)
          }

          await wait(0.8 * 1000)
          await reaction.users.remove(user.id)

          if (paginaAtual > pagsTotal) return firstPag();

          const reactions = {
            '🔁': () => {
              return firstPag()
            },
            '⏩': () => {
              if (pagsTotal == 1) return;
              if (paginaAtual == pagsTotal) return firstPag();
              paginaAtual++
              return mudarMsg(paginaAtual, pagsTotal)
            },
            '⏪': () => {
              if (pagsTotal == 1) return;
              if (paginaAtual == 1) {
                paginaAtual = pagsTotal
                return mudarMsg(pagsTotal, pagsTotal);
              }
              paginaAtual--
              return mudarMsg(paginaAtual, pagsTotal)
            }
          }
          await reactions[reaction.emoji.name]()
        } catch (e) {
          return console.log(e)
        }
      });

      collector.on('end', collected => {
        msg_principal.delete().catch(() => { })
      })
    } catch (e) { console.log(e) }
  }
}
