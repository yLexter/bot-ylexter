const { MessageEmbed } = require("discord.js");
const mongoose = require('mongoose');
const Database = require('../../Database/moongose')

module.exports = {
    name: "setchannelmusic",
    help: "Seta um canal para ser o canal de música , use <command> + menção de um canal usando #",
    type: "admin",
    cooldown: 20,
    aliase: ["stmusic"],
    execute: async (client, msg, args, cor) => {
        try {

            let channel = msg.mentions.channels.first()

            if (!channel || channel.type != 'GUILD_TEXT') {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ❌ Mencione um Canal de Texto, use o #`, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            const { modelo } = await Database.fecthGuild(client, msg)

            await modelo.findOneAndUpdate({ id: msg.guild.id }, { channelMusic: channel.id })

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(`O Canal de música foi setado para: <#${channel.id}>`)
                .setAuthor({ name: `| ✔️ | Sucesso `, iconURL: msg.author.displayAvatarURL() })
            return msg.channel.send({ embeds: [helpMsg] })

        } catch (e) {
            msg.channel.send({ content: '❌ Ocorreu um Erro , Tente novamente.' })
        }
    }
}

