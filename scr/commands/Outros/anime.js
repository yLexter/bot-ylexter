const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');

module.exports = {
  name: "anime",
  help: "az uma busca por um anime",
  type: "anime",
  aliase: [],
  execute: async (client, msg, args, cor) => {

    const helpMsg1 = new MessageEmbed()
      .setAuthor({ name: `| Procurando...`, iconURL: msg.author.displayAvatarURL() })
    let msg_embed = await msg.channel.send({ embeds: [helpMsg1] }).catch(() => { })

    try {

      const s = args.join(" ")

      if (!s) {
        const helpMsg = new MessageEmbed()
          .setAuthor({ name: `| Informe um Anime.`, iconURL: msg.author.displayAvatarURL() })
        return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })
      }

      const baseUrl = 'https://kitsu.io/api/edge'
      const animeSearch = '/anime?filter[text]='
      const request = await fetch(`${baseUrl + animeSearch + s}`).then(response => response.json())
      const data = request.data[0]
      const msgError = '???'

      if (!data) {
        const helpMsg = new MessageEmbed()
          .setAuthor({ name: `| Anime não Encontrado.`, iconURL: msg.author.displayAvatarURL() })
        return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })
      }

      const { episodeCount, averageRating, youtubeVideoId,
        popularityRank, titles,
        synopsis, startDate, endDate,
        posterImage, status, description, canonicalTitle } = data.attributes

      function firstKeyUpper(string) {
        return string[0].toUpperCase() + string.slice(1, string.length)
      }

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setTitle(`${canonicalTitle || titles.en_jp || msgError}`)
        .setDescription(`${synopsis || description || msgError}`)
        .addFields(
          { name: 'Estreia', value: startDate || msgError, inline: true },
          { name: 'Encerramento', value: endDate || msgError, inline: true },
          { name: 'Status', value: firstKeyUpper(status) || msgError, inline: true },
          { name: 'Popularidade', value: `${popularityRank || msgError}`, inline: true },
          { name: 'Nota', value: `${averageRating || msgError}/100`, inline: true },
          { name: 'Episodios', value: `${episodeCount || msgError}`, inline: true },
        )
        .setThumbnail(`${posterImage.small || posterImage.medium}`)
        .setURL(`https://www.youtube.com/watch?v=${youtubeVideoId || 'dQw4w9WgXcQ'}`)
        .setAuthor({ name: `| 🏆 Anime `, iconURL: msg.author.displayAvatarURL() })
      return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })

    } catch (e) {
      const helpMsg = new MessageEmbed()
        .setAuthor({ name: `| Ops, Tente Novamente.`, iconURL: msg.author.displayAvatarURL() })
      return msg_embed.edit({ embeds: [helpMsg] }).catch(e => { })
    }
  }
}
