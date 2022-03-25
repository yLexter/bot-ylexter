const { MessageEmbed } = require("discord.js");
const Database = require('../../Database/moongose')

module.exports = {
    name: "removechannelmusic",
    help: "Remove o canal canal de música",
    type: "admin",
    cooldown: 30,
    aliase: ["rcmusic"],
    execute: async (client, msg, args, cor) => {
        try {

            await Database.guild.findOneAndUpdate({ id: msg.guild.id }, { channelMusic: null })

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ✔️ | Canal de Música foi Removido.`, iconURL: msg.author.displayAvatarURL() })
            return msg.channel.send({ embeds: [helpMsg] })

        } catch (e) {
            msg.channel.send({ content: '❌ Ocorreu um Erro , tente novamente.' })
        }
    }
}

