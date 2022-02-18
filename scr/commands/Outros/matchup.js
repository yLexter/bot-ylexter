const { MessageEmbed } = require("discord.js");
const config = require('../Outros/config_others.json')
const wait = require('util').promisify(setTimeout)

module.exports = {
   name: "matchup",
   help: "Exibe matchups do Darius",
   type: "fun",
   aliase: [],
   execute: (client, msg, args, cor) => {

      try {

         const s = args.join(" ")
         const urlDarius = 'https://cdn1.dotesports.com/wp-content/uploads/sites/3/2018/10/02115246/dariusgodking-770x454.jpg'
         const campeao = config.matchups.find(element => element.champion.toLowerCase() == s.toLowerCase())

         campeao ? especificChampion() : allChampion()

         function especificChampion() {
            const { champion, runas, url, description } = campeao
            const helpMsg = new MessageEmbed()
               .setColor(cor)
               .setThumbnail(url)
               .setAuthor({ name: `Matchup x ${champion}`, iconURL: msg.author.displayAvatarURL() })
               .addFields(
                  { name: "Dicas", value: `${description}\n` },
                  { name: "Runas", value: runas })
            return msg.channel.send({ embeds: [helpMsg] })
         }


         function allChampion() {

            const string = config.matchups.map((element, index) => {
               let contador = index + 1
               return `${contador}. ${element.champion}`
            }).join('\n')

            const helpMsg = new MessageEmbed()
               .setColor(cor)
               .setDescription(`**${string}**`)
               .setThumbnail(urlDarius)
               .setAuthor({ name: `Matchups Disponiveis`, iconURL: msg.author.displayAvatarURL() })
            return msg.channel.send({ embeds: [helpMsg] })

         }

      } catch (e) {
         console.log(e)
      }
   }

};// Execute End;











