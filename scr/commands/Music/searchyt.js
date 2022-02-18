const { MessageEmbed, MessageCollector } = require("discord.js");
const YouTube = require("youtube-sr").default;
const wait = require('util').promisify(setTimeout);
const SearchYT = new Map();

module.exports = {
  name: "searchyt",
  help: "Faz uma pesquisa no youtube e toca a música desejada",
  type: "music",
  aliase: ["syt"],
  execute: async (client, msg, args, cor) => {

    const { PushAndPlaySong } = client.music

    try {
      msg.delete().catch(() => { })
      const s = args.join(" ");
      if (!s) return;
      const queueSyt = SearchYT.get(msg.guild.id)
      const listResult = await YouTube.search(s, { limit: 11 });
      const listaFiltrado = listResult.filter(m => { return m.duration > 0 })
      const maxTempo = 30
      const totalResult = listaFiltrado.length - 1

      if (queueSyt || (listaFiltrado && listaFiltrado.length == 0)) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: `| ❌ Erro`, iconURL: msg.author.displayAvatarURL() })
          .setDescription('Pesquisa invalida ou Busca em andamento')
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
        .setFooter({ text: `Digite um número de 0 a ${totalResult} dentre ${maxTempo}s para por a Música , Caso contrário a Busca será Cancelada | Use !cancel para Cancelar.` })
      var msg_pesquisa = await msg.channel.send({ embeds: [helpMsg] })

      const filter = m => {
        return ((m.content >= 0 && m.content <= totalResult) || m.content == "!cancel")
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
        const song = listaFiltrado[m]
        await wait(0.5 * 1000)
        m.delete().catch(() => { })
        if (m.content.toLowerCase() == "!cancel") return collector.stop();
        PushAndPlaySong(client, msg, cor, song)
      });

      collector.on('end', collected => {
        msg_pesquisa.delete().catch(() => { })
        SearchYT.delete(msg.guild.id)
      });


    } catch (e) { msg.channel.send(`\`${e}\``) }

  }
};








