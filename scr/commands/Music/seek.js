const { MessageEmbed, } = require("discord.js");
const Utils = require("../../classes/Utils")
const Command = require('../../classes/command')

class CommandSeek extends Command {
    constructor() {
        super({
            name: "seek",
            help: "Avança ou retrocede para minutagem desejada.",
            type: "music",
            cooldown: 5,
            usage: '<Comando> + <Minutagem> || Ex: seek 1:00',
            aliase: [],
        })
    }

    async execute(client, msg, args) {
        const { cor } = client

        try {
            const queue = client.queues.get(msg.guild.id);
            const { seek } = client.music

            if (!queue || !args[0]) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ❌ Erro `, iconURL: msg.author.displayAvatarURL() })
                    .setDescription('Não existe músicas sendo tocada ou não existe argumentos')
                return msg.channel.send({ embeds: [helpMsg] })
            }

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Seeking... `, iconURL: msg.author.displayAvatarURL() })
            var msgPrincipal = await msg.channel.send({ embeds: [helpMsg] })

            const secondsFinal = await Utils.textToSeconds(args[0])

            seek(client, msg, secondsFinal)

        } catch (e) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ${e} `, iconURL: msg.author.displayAvatarURL() })
            msgPrincipal.edit({ embeds: [helpMsg] }).catch(e => { })
        }
    }
}

module.exports = CommandSeek