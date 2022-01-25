
module.exports = {
  name: "stop",
  help: "Para a reprodução de músicas no servidor",
  type: 'music',
  aliase: [],
  execute: (client, msg, args, cor) => {

    const { stopMusic } = client.music
    const { MessageEmbed } = require("discord.js");

    try {

      const queue = client.queues.get(msg.guild.id);

      if (!queue) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
          .setDescription('Não existe músicas na queue.')
        return msg.channel.send({ embeds: [helpMsg] })
      }

      stopMusic(client, msg , cor)

    } catch (e) { stopMusic(client, msg), msg.channel.send(`\`${e}\``) }


  }
};







