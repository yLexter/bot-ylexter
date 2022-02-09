module.exports = {
  name: "queue",
  help: "Mostra as músicas da fila",
  type: 'music',
  aliase: [],
  execute: async (client, msg, args, cor) => {

    const { MessageEmbed } = require("discord.js");
    const { secondsToText } = client.music
    const wait = require('util').promisify(setTimeout);

    try {
      const queue = client.queues.get(msg.member.guild.id);

      if (!queue || queue.songs.length == 0) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
          .setDescription('Não existe músicas sendo tocada.')
        return msg.channel.send({ embeds: [helpMsg] })
      }

      const { songs } = queue
      let quantidadePerPag = 10
      var pags = total_pags()
      let contador = 1
      const finishCommmand = 300

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
        const { songs } = queue
        const total = songs.length - 1
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
      
      const helpMsg10 = new MessageEmbed()
        .setColor(cor)
        .setDescription(queuePags(1))
        .setAuthor({ name: `| 📑 Queue`, iconURL: msg.author.displayAvatarURL() })
        .addField("Info's", `\nTotal: ${songs.length - 1} | Pag's: ${contador}/${pags} | Tempo: ${secondsToText(somarDuration())}`)
      let msg_principal = await msg.channel.send({ embeds: [helpMsg10] })

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

          if (!queue || queue.songs.length == 0) {
            return collector.stop()
          }

          const pagsTotal = total_pags()

          await wait(0.8 * 1000)
          await reaction.users.remove(user.id)

          function mudarMsg(number) {
            const helpMsg = new MessageEmbed()
              .setColor(cor)
              .setDescription(queuePags(number))
              .setAuthor({ name: `| 📑 Queue`, iconURL: msg.author.displayAvatarURL() })
              .addField("Info's", `\nTotal: ${queue.songs.length - 1} | Pag's: ${contador}/${pagsTotal} | Tempo: ${secondsToText(somarDuration())}`)
            return msg_principal.edit({ embeds: [helpMsg] }).catch(() => { })
          }

          function firstPag() {
            contador = 1
            return mudarMsg(1)
          }

          if (contador > pagsTotal) {
            return firstPag()
          }

          const reactions = {
            '🔁': () => {
              return firstPag()
            },
            '⏩': () => {
              if (pagsTotal == 1) return;
              if (contador == pagsTotal) return firstPag();
              contador++
              return mudarMsg(contador)
            },
            '⏪': () => {
              if (pagsTotal == 1) return;
              if (contador == 1) {
                contador = pagsTotal
                return mudarMsg(pagsTotal);
              }
              contador--
              return mudarMsg(contador)
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
















