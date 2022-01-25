module.exports = {
   name: "matchup",
   help: "Exibe matchups do Darius",
   type: "others",
   aliase: [],
   execute: (client, msg, args, cor) => {

      let { MessageEmbed, MessageCollector } = require("discord.js");
      const config = require('../Outros/config_others.json')
      const wait = require('util').promisify(setTimeout)

      try {

         const s = args.join(" ")
         const campeao = config.matchups.find(element => element.champion.toLowerCase() == s.toLowerCase())

         const { champion, runas, url, description } = campeao

         const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setThumbnail(url)
            .setAuthor({name: `Matchup x ${champion}` , iconURL: msg.author.displayAvatarURL()})
            .addFields(
               { name: "Dicas", value: `${description}\n` },
               { name: "Runas", value: runas })
         msg.channel.send({ embeds: [helpMsg] })


      } catch (e) {
         let string = ''
         config.matchups.forEach((element, index) => {
            let contador = index + 1
            string += `${contador}. ${element.champion}\n`
         })

         const helpMsg = new MessageEmbed()
            .setColor('#B22222')
            .setDescription(`**${string}**`)
            .setThumbnail('https://cdn1.dotesports.com/wp-content/uploads/sites/3/2018/10/02115246/dariusgodking-770x454.jpg')
            .setAuthor({name: `Matchups Disponiveis` , iconURL: msg.author.displayAvatarURL()})
         return msg.channel.send({ embeds: [helpMsg] })
      }
   }

};// Execute End;











