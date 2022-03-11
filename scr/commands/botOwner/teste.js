module.exports = {
   name: "eval",
   help: "Executa comando como caller",
   type: "ownerBot",
   botOwner: true,
   aliase: ["t"],
   execute: async (client, msg, args, cor) => {

      const { MessageEmbed, MessageCollector } = require("discord.js");
      const Database = require('../../Database/moongose')
      const Otaku = require('../../Functions/animes')
      const s = args.join(" ")

      try {
         if (msg.author.id != '288871181514440706') return;
         msg.delete().catch(() => { })
         const mongoose = require('mongoose');
         const Youtube = require("youtube-sr").default;
         const { getData, getPreview, getTracks } = require('spotify-url-info')
         const fetch = require('node-fetch');
         const play = require('play-dl')
         const { textToSeconds, secondsToText } = client.music
         const {
            AudioPlayerStatus,
            StreamType,
            createAudioPlayer,
            createAudioResource,
            joinVoiceChannel,
         } = require('@discordjs/voice');

         const resultado_ok = await eval(`(async () => { return ${s}})()`)
         console.log(resultado_ok)

         const resultado = JSON.stringify(resultado_ok, null, '\t')

         const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setDescription(`📥 **Entrada**\n\n` + `\`${s}\`` + `\n\n📤 **Saida**\n\n` + `\`${resultado}\``)
         return msg.channel.send({ embeds: [helpMsg] }).catch((e) => { console.log(e) })

      } catch (e) {

         const helpMsg3 = new MessageEmbed()
            .setColor(cor)
            .setDescription(`📥 **Entrada**\n\n` + `\`${s}\`` + `\n\n📤 **Saida**\n\n` + `\`${e}\``)
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










