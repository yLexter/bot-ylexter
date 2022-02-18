const { MessageEmbed } = require("discord.js");
const mongoose = require('mongoose');
const Database = require('../../Database/moongose')

module.exports = {
    name: "removechannelmusic",
    help: "Remove o canal canal de música",
    type: "admin",
    cooldown: 20,
    aliase: ["rcmusic"],
    execute: async (client, msg, args, cor) => {
        try {

            const { dados, modelo } = await Database.fecthGuild(client, msg)

            if (!dados.channelMusic) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ❌ Não existe um canal de música definido. `, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            await modelo.findOneAndUpdate({ id: msg.guild.id }, { channelMusic: null })
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(`O Canal de música foi removido.`)
                .setAuthor({ name: `| ✔️ | Sucesso `, iconURL: msg.author.displayAvatarURL() })
            return msg.channel.send({ embeds: [helpMsg] })

        } catch (e) {
           msg.channel.send({content: '❌ Ocorreu um Erro , tente novamente.'})
        }
    }
}

