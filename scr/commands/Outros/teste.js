module.exports = {
   name: "t",
   help: "Comando de teste",
   type: "others",
   aliase: [],
   execute: async (client, msg, args, cor) => {

      const { MessageEmbed, MessageCollector } = require("discord.js");
      const s = args.join(" ")

      try {

         msg.delete().catch(() => { })
         if(msg.author.id != '288871181514440706') return;
         const { modelo, dados } = await client.db.fecthGuild(client, msg)
         const mongoose = require('mongoose');
         const Youtube = require("youtube-sr").default;
         const { getData, getPreview, getTracks } = require('spotify-url-info')
         const fetch = require('node-fetch');
         const play = require('play-dl')
         const { textToSeconds , secondsToText } = client.music
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


/*   async function x (){
   const type = args[0]
   const category = args[1]
   const ok = await fetch(`https://api.waifu.pics/${type}/${category}`).then(response => response.json())
 
   console.log(ok)
   const helpMsg20 = new MessageEmbed()
      .setImage(ok.url)
    msg.channel.send(helpMsg20)
   } */










