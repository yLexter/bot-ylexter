const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { secondsToText } = require("../../classes/Utils")
const Command = require('../../classes/command')

class CommandQueue extends Command {
  constructor() {
    super({
      name: "queue",
      help: "Mostra as músicas da fila",
      type: 'music',
      cooldown: 20,
      aliase: [],
    })
  }

  async execute(client, msg, args) {

    const { cor } = client
    const { musicVetor } = client.music

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
      const finishCommmand = 240
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('ttretroceder')
            .setEmoji('⏮️')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId('retroceder')
            .setEmoji('⏪')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId('reload')
            .setEmoji('🔁')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId('avançar')
            .setEmoji('⏩')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId('ttavançar')
            .setEmoji('⏭️')
            .setStyle('PRIMARY'),
        );

      let msg_principal = await msg.channel.send({ embeds: [msgEmbed(paginaAtual, pagsTotal)], components: [row] })

      function queuePags(number) {
        const queue = client.queues.get(msg.guild.id);
        const { songs } = queue
        let string = `🔊 **Tocando agora**\n[${songs[0].title}](${songs[0].url})\n${musicVetor(client, msg)}\n\n`
        let pagAtual = number == 1 ? 1 : number * quantidadePerPag - quantidadePerPag + 1
        for (let i = pagAtual; i < pagAtual + quantidadePerPag; i++) {
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
        for (let msc of queue.songs) {
          string += msc.duration
        };
        return string / 1000
      }

      function msgEmbed(position, pags) {
        const queue = client.queues.get(msg.guild.id);
        const quantidadeSongs = queue.songs.length - 1 == 0 ? 1 : queue.songs.length - 1
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setDescription(queuePags(position))
          .setAuthor({ name: `| 📑 Queue`, iconURL: msg.author.displayAvatarURL() })
          .setFooter({ text: `Músicas: ${quantidadeSongs} | Pag's: ${paginaAtual}/${pags} | Tempo: ${secondsToText(somarDuration())}` })
        return helpMsg
      }

      function mudarMsg(number, pagsTotal) {
        return msg_principal.edit({ embeds: [msgEmbed(number, pagsTotal)] }).catch(() => { })
      }

      const collector = await msg_principal.createMessageComponentCollector({
        filter: i => {
          i.deferUpdate()
          return i.user.id == msg.author.id
        },
        componentType: 'BUTTON',
        time: finishCommmand * 1000, max: 30
      });

      collector.on('collect', async i => {
        try {
          const queue = client.queues.get(msg.guild.id);

          if (!queue || queue.songs.length == 0) return collector.stop();

          const pagsTotal = total_pags()

          function firstPag() {
            paginaAtual = 1
            return mudarMsg(paginaAtual, pagsTotal)
          }

          if (paginaAtual > pagsTotal) {
            return firstPag();
          }

          const buttons = {
            'avançar': () => {
              if (pagsTotal == 1 || paginaAtual == pagsTotal) return;
              paginaAtual++
              return mudarMsg(paginaAtual, pagsTotal)
            },
            'retroceder': () => {
              if (pagsTotal == 1 || paginaAtual == 1) return;
              paginaAtual--
              return mudarMsg(paginaAtual, pagsTotal)
            },
            'ttavançar': () => {
              if (paginaAtual == pagsTotal) return;
              paginaAtual = pagsTotal
              return mudarMsg(paginaAtual, pagsTotal)
            },
            'ttretroceder': () => {
              if (paginaAtual == 1) return
              return firstPag()
            },
            'reload': () => {
              mudarMsg(paginaAtual, pagsTotal)
            }
          }

          await buttons[i.customId]()

        } catch (e) {
          return console.log(e)
        }
      });

      collector.on('end', collected => {
        msg_principal.edit({ components: [] }).catch(() => { })
      })
    } catch (e) { console.log(e) }
  }
}

module.exports = CommandQueue



