module.exports = {
  name: "skip",
  help: "Pula para a proxima música.",
  type: 'music',
  aliase: [],
  execute: (client, msg, args, cor) => {

    const { stopMusic, backMusic , playSong } = client.music
    const { MessageEmbed } = require("discord.js");

    try {
      let queue = client.queues.get(msg.guild.id);
      if (args[0]) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({name: `| Use: skipto para skipar a músicas`, iconURL: msg.author.displayAvatarURL()})
        return msg.channel.send({ embeds: [helpMsg] })
      }
      
      if (!queue) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setDescription('Não existe musicas sendo tocada.')
          .setAuthor({name:`|Erro`, iconURL: msg.author.displayAvatarURL()})
        return msg.channel.send({ embeds: [helpMsg] })
      }

      if (!queue.loop) backMusic(client, msg), client.queues.set(msg.guild.id, queue);
      let song = queue.songs[0]
      playSong(client, msg, song);
      
      if (queue.songs.length > 0) {
        let url = song.url
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setDescription(`[${song.title}](${url}) [${song.durationFormatted}]`)
          .setAuthor({name: `| ⏯️ Skipped `, iconURL: msg.author.displayAvatarURL()})
        return  msg.channel.send({ embeds: [helpMsg] })
      } 
      
    } catch (e) { stopMusic(client, msg , cor), msg.channel.send(`\`${e}\``) }
  }
};




