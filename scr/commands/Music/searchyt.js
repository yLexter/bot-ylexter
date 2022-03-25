const { MessageEmbed, MessageCollector } = require("discord.js");
const YouTube = require("youtube-sr").default;
const wait = require('util').promisify(setTimeout);
const SearchYT = new Map();

module.exports = {
  name: "searchyt",
  help: "Faz uma pesquisa no youtube e toca a música desejada",
  type: "music",
  aliase: ["syt"],
  usage: '<Comando> + <Pequisa>',
  execute: async (client, msg, args, cor) => {

    const { PushAndPlaySong } = client.music

    try {
      msg.delete().catch(() => { })
      const s = args.join(" ");
      if (!s) return;

      const queueSyt = SearchYT.get(msg.guild.id)
      const listaFiltrado = (await YouTube.search(s, { limit: 11 })).filter(m => { return m.duration > 0 })
      const maxTempo = 30

      if (queueSyt || (listaFiltrado && !listaFiltrado.length)) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| ❌ Erro`, iconURL: msg.author.displayAvatarURL() })
          .setDescription('Pesquisa invalida ou Busca em andamento.')
        return msg.channel.send({ embeds: [helpMsg] })
      }

      SearchYT.set(msg.guild.id, true)

      const string = listaFiltrado.map((element, indice) => {
        return `${indice}. [${element.title}](${element.url}) [${element.durationFormatted}]`
      }).join('\n')

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setDescription(string)
        .setAuthor({ name: `|🔎 Pesquisa do Youtube`, iconURL: msg.author.displayAvatarURL() })
        .setFooter({ text: `Digite um número de 0 a ${listaFiltrado.length - 1} dentre ${maxTempo}s para por a música , caso contrário a Busca será cancelada | Use !cancel para Cancelar.` })
      var msg_pesquisa = await msg.channel.send({ embeds: [helpMsg] })

      const collector = msg.channel.createMessageCollector({
        filter: m => { return (listaFiltrado[m] || m.content == "!cancel") && msg.author.id === m.author.id },
        time: maxTempo * 1000,
        max: 1
      })

      collector.on('collect', async m => {
        await wait(0.5 * 1000)
        m.delete().catch(() => { })
        if (!m.member.voice.channel || m.content.toLowerCase() == "!cancel") return collector.stop();
        PushAndPlaySong(client, msg, cor, listaFiltrado[m])
      });

      collector.on('end', collected => {
        msg_pesquisa.delete().catch(() => { })
        SearchYT.delete(msg.guild.id)
      });

    } catch (e) { msg.channel.send(`\`${e}\``), SearchYT.delete(msg.guild.id) }

  }
};








