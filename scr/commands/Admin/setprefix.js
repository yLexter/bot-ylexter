const { MessageEmbed } = require("discord.js");
const mongoose = require('mongoose');
const Database = require('../../Database/moongose')

module.exports = {
     name: "setprefix",
     help: "Muda o prefixo do bot",
     type: "admin",
     aliase: [],
     execute: async (client, msg, args, cor) => {

          try {
               const { modelo, dados } = await Database.fecthGuild(client, msg)
               const newPrefix = args.join(" ")

               if (!newPrefix || newPrefix.length > 3 || newPrefix.startsWith("/")) {
                    return msg.reply({ content: "Insira um prefix valido menor q 3 caracteres." })
               }

               await modelo.findOneAndUpdate({ id: msg.guild.id }, { prefix: newPrefix })

               const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ✔️ Prefixo mudado para: ${newPrefix} `, iconURL: msg.author.displayAvatarURL() })
               return msg.channel.send({ embeds: [helpMsg] })

          } catch (e) { console.log(e) }

     } // Execute End
}

