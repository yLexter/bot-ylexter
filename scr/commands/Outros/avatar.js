const { MessageEmbed } = require("discord.js");
const Command = require('../../classes/command')

class CommandAvatar extends Command {
    constructor() {
        super({
            name: "avatar",
            help: "Exibe o seu avatar.",
            type: "others",
            usage: '<Comando> + <Menção ao User ou ID> || *Para ver o seu, use apenas <Comando>.',
            aliase: [],
        })
    }

    async execute(client, msg, args) {
        const { cor } = client

        try {
            const mention = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]) || msg.member
            const link = mention.displayAvatarURL({ size: 1024, dynamic: true })
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(`[Link do Avatar](${link})`)
                .setTitle(`Avatar de ${mention.user.username}#${mention.user.discriminator}`)
                .setImage(link)
            return msg.channel.send({ embeds: [helpMsg] })
        } catch (e) { return msg.channel.send(`\`${e}\``) }
    }
}

module.exports = CommandAvatar
