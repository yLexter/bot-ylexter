module.exports = {
  name: "config",
  help: "Seta configurações do server , Use Config + Parametro | Parametros [stcmusic: Seta o canal atual para ser o canal de  música , rcmusic: remove o canal de música]",
  type: "admin",
  aliase: [],
  onlyOwner: false,
  execute: async (client, msg, args, cor) => {
    try {
      const { MessageEmbed } = require("discord.js");
      const mongoose = require('mongoose');
      const opcao = args[0].toLowerCase()
      const canalId = msg.channel.id
      const { modelo, dados } = await client.db.fecthGuild(client, msg)

      const options = {

        stcmusic: async () => {
          const doc = await modelo.findOneAndUpdate({ id: msg.guild.id }, { channelMusic: canalId })
          const helpMsg = new MessageEmbed()
            .setColor('#B22222')
            .setDescription(`O Canal de música foi setado para: <#${canalId}>`)
            .setAuthor({ name: `| ✔️ | Sucesso `, iconURL: msg.author.displayAvatarURL() })
          return msg.channel.send({ embeds: [helpMsg] })
        },
        rcmusic: async () => {
          const doc = await modelo.findOneAndUpdate({ id: msg.guild.id }, { channelMusic: null })
          const helpMsg = new MessageEmbed()
            .setColor('#B22222')
            .setAuthor({ name: 'Canal de Música removido', iconURL: msg.author.displayAvatarURL() })
          return msg.channel.send({ embeds: [helpMsg] })

        }
      }

      try {
        await options[opcao]()
      } catch (e) {
        msg.reply('Parâmetro invalido , use o help + config para ver os parâmetros válidos')
      }

    } catch (e) { return }

  }
}

