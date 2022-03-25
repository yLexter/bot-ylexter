const { MessageEmbed } = require("discord.js");
const Database = require('../../Database/moongose')

module.exports = {
    name: "setchannelmusic",
    help: "Seta um canal para ser o canal de música, todos os comando de música só poderão ser usado no canal de música.",
    type: "admin",
    usage: '<Comando> + <Menção ao Canal> || Para mencionar o canal digite # e selecione o canal.',
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

            await Database.guild.findOneAndUpdate({ id: msg.guild.id }, { channelMusic: channel.id })

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

