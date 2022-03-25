const { MessageEmbed } = require("discord.js");
const Database = require('../../Database/moongose')

module.exports = {
  name: "logs",
  help: "Mostra os logs do servidor.",
  usage: '<Comandos> || <Comando + Menção ao User ou ID, Filtra os logs de um membro.>',
  type: "admin",
  cooldown: 40,
  aliase: [],
  execute: async (client, msg, args, cor) => {

    try {

      const finishCommand = 120
      const membro = msg.mentions.members.first() || msg.guild.members.cache.get(args[0])
      const quantidadePerPag = 5
      let logs = (await Database.guild.findOne({ id: msg.guild.id }))?.logs
      let pagAtual = 0
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('forward')
            .setEmoji('◀️')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId('rewind')
            .setEmoji('▶️')
            .setStyle('PRIMARY'),
        );


      if (membro) {
        logs = logs.filter(x => { return x.id == membro.user.id })
      }

      if (!logs.length) return msg.reply('Os logs estão vazios.')

      const logsAmount = logs.length < quantidadePerPag ? 1 : Math.ceil(logs.length / quantidadePerPag)
      const msgPrincipal = await msg.channel.send({ embeds: [embed(logsPag(contador))], components: [row] })

      function logsPag(number) {
        let string = ``
        let pagAtual = number == 1 ? 1 : number * quantidadePerPag - quantidadePerPag + 1
        for (i = pagAtual; i < pagAtual + quantidadePerPag; i++) {
          if (!logs[i]) break;
          const { id, logId, nome, motivo, data, autor, } = logs[i]
          string += `logID \`${logId}\n\`ID \`${id}\`\nAdvertido \`${nome}\`\nMotivo \`${motivo}\` Author \`${autor}\`\n Data \`${data}\` `
        }
        return string
      }

      function embed(string) {
        return new MessageEmbed()
          .setColor(cor)
          .setDescription(string)
          .setAuthor({ name: `| 🛠️ Logs`, iconURL: msg.author.displayAvatarURL() })
          .setFooter({ text: `Pags: ${contador + 1}/${logsAmount}` })
      }

      const filter = i => {
        i.deferUpdate()
        return msg.author.id == i.user.id
      }

      function editEmbed(number) {
        return msgPrincipal.edit({ embeds: [embed(logsPag(number))], components: [row] })
      }

      const collector = msgPrincipal.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: finishCommand * 1000, max: 15 });

      collector.on('collect', i => {
        const buttons = {
          'forward': () => {
            if (pagAtual == 0) return;
            pagAtual--
            editEmbed(contador)
          },
          'rewind': () => {
            if (pagAtual == logsAmount) return;
            pagAtual++
            editEmbed(contador)
          }
        }

        try {
          buttons[i.customId]()
        } catch (e) {
          console.log(e)
        }

      });

      collector.on('end', collected => {
        msgPrincipal.edit({ components: [] }).catch(() => { })
      });



    } catch (e) { msg.channel.send(`\`${e}\``) }
  }

}