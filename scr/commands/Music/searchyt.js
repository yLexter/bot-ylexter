const { MessageEmbed, MessageCollector } = require("discord.js");
const YouTube = require("youtube-sr").default;
const wait = require('util').promisify(setTimeout);

module.exports = {
  name: "searchyt",
  help: "Faz uma pesquisa no youtube e toca a música desejada",
  type: "music",
  aliase: ["syt"],
  execute: async (client, msg, args, cor) => {

    const { playSong } = client.music

    try {
      msg.delete().catch(() => { })
      const s = args.join(" ");
      if (!s) return;
      let string = '';
      const queueSyt = client.queues.get(`${msg.guild.id}.YT`)
      const listResult = await YouTube.search(s, { limit: 11, safeSearch: true });
      const listaFiltrado = listResult.filter(m => { return m.duration > 0 })
      const maxTempo = 30

      if (queueSyt || (listaFiltrado && listaFiltrado.length == 0)) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
          .setDescription('Pesquisa invalida ou Busca em andamento')
        return msg.channel.send({ embeds: [helpMsg] })
      }

      client.queues.set(`${msg.guild.id}.YT`, true)
      listaFiltrado.forEach((element, indice) => {
        string += `${indice}. [${element.title}](${element.url}) [${element.durationFormatted}]\n`
      });

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setDescription(string)
        .setAuthor({ name: `|🔎 Pesquisa do Youtube`, iconURL: msg.author.displayAvatarURL() })
        .addField("Info:", `Digite um número de **0 a ${listaFiltrado.length - 1}** dentre **${maxTempo}s** para por a música , caso contrário a busca será **cancelada** | Use **!cancel para cancelar.**`)
      var msg_pesquisa = await msg.channel.send({ embeds: [helpMsg] })

      const filter = m => {
        return ((m.content >= 0 && m.content <= listaFiltrado.length - 1) || m.content == "!cancel")
          && m.member.voice.channel
          && msg.author.id === m.author.id
          && msg.channel.id === m.channel.id
      }
      const collector = msg.channel.createMessageCollector({
        filter,
        time: maxTempo * 1000,
        max: 1
      })

      collector.on('collect', async m => {
        await wait(0.5 * 1000)
        m.delete().catch(() => { })
        if (m.content.toLowerCase() == "!cancel") return collector.stop();
        const song = listaFiltrado[m]
        const queue = client.queues.get(msg.guild.id);
        if (queue) {
          queue.songs.push(song);
          client.queues.set(msg.guild.id, queue);
          const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setTitle(`${song.title}`)
            .setAuthor({ name: `| 🎶 Adicionado a Fila`, iconURL: msg.author.displayAvatarURL() })
            .setURL(song.url)
            .setDescription(`Duração: **${song.durationFormatted}**`)
          return msg.channel.send({ embeds: [helpMsg] })
        } else return playSong(client, msg, song);
      });

      collector.on('end', collected => {
        msg_pesquisa.delete().catch(() => { })
        client.queues.delete(`${msg.guild.id}.YT`)
      });


    } catch (e) { msg.channel.send(`\`${e}\``) }

  }
};








