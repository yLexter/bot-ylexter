const Command = require('../../classes/command')

class CommandEval extends Command {
   constructor() {
      super({
         name: "eval",
         help: "Executa comando como caller",
         type: "ownerBot",
         aliase: ["t"],
      })
   }

   async execute(client, msg, args) {

      const { cor } = client
      const classMusic = require('../../classes/musicSettings')
      const { MessageEmbed, MessageCollector } = require("discord.js");
      const moment = require('moment')
      const Database = require('../../Database/moongose')
      const Otaku = require('../../classes/animes')
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
            .setDescription(`📥 **Entrada**\n\n` + `\`\`\`txt\n${s}\n\`\`\`` + `\n\n📤 **Saída**\n\n` + '```js\n' + `- ${e.stack}\n` + '```')
         return msg.channel.send({ embeds: [helpMsg3] }).catch(() => { })
      }

   }
};


module.exports = CommandEval











