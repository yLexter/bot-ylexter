module.exports = {
   name: "eval",
   help: "Executa comando como caller",
   type: "ownerBot",
   aliase: ["t"],
   execute: async (client, msg, args, cor) => {

      const classMusic = require('../../Functions/musicSettings')
      const { MessageEmbed, MessageCollector } = require("discord.js");
      const moment = require('moment')
      const Database = require('../../Database/moongose')
      const Otaku = require('../../Functions/animes')
      const s = args.join(" ")
      const mongoose = require('mongoose');
      const Youtube = require("youtube-sr").default;
      const { getData, getPreview, getTracks } = require('spotify-url-info')
      const fetch = require('node-fetch');
      const play = require('play-dl')
      const {
         AudioPlayerStatus,
         StreamType,
         createAudioPlayer,
         createAudioResource,
         joinVoiceChannel,
      } = require('@discordjs/voice');


      try {
         let song = {
            "type": "track",
            "id": "rn_YodiJO6k",
            "title": "Red Hot Chili Peppers - Otherside [Official Music Video]",
            "url": "https://www.youtube.com/watch?v=rn_YodiJO6k",
            "duration": 256000,
            "durationFormatted": "4:16"
         }

         msg.delete().catch(() => { })
         const resultado_ok = await eval(`(async () => { return ${s}})()`)
         console.log(resultado_ok)
         const resultado = JSON.stringify(resultado_ok, null, '\t')?.substring(0, 3000)

         const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setDescription(`📥 **Entrada**\n\n` + `\`\`\`txt\n${s}\n\`\`\`` + `\n\n📤 **Saída**\n\n` + `\`\`\`txt\n${resultado}\n\`\`\`\n`)
         return msg.channel.send({ embeds: [helpMsg] }).catch((e) => { console.log(e) })

      } catch (e) {
         const helpMsg3 = new MessageEmbed()
            .setColor(cor)
            .setDescription(`📥 **Entrada**\n\n` + `\`\`\`txt\n${s}\n\`\`\`` + `\n\n📤 **Saída**\n\n` + '```Diff\n' + `- ${e}\n` + '```')
         return msg.channel.send({ embeds: [helpMsg3] }).catch(() => { })
      }

   }
};


/* const { MessageEmbed } = require("discord.js");

module.exports = {
   name: "",
   help: "",
   type: '',
   aliase: [],
   execute: async (client, msg, args, cor) => {

      try {


      } catch (e) {  msg.channel.send(`\`${e}\``) }
   }
}; // Execute end

 */










