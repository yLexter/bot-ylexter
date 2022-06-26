const { MessageEmbed } = require("discord.js");
const Database = require('../../Database/moongose')
const Command = require('../../classes/command')

class CommandRemoveChannelMusic extends Command {
    constructor() {
        super({
            name: "removechannelmusic",
            help: "Remove o canal canal de música",
            type: "admin",
            cooldown: 30,
            aliase: ["rcmusic"],
        })
    }

    async execute(client, msg, args) {

        const { cor } = client

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

module.exports = CommandRemoveChannelMusic

