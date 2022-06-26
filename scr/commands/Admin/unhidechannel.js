const { MessageEmbed } = require("discord.js");
const Command = require('../../classes/command')

class CommandUnhideChannel extends Command {
    constructor() {
        super({
            name: "unhidechannel",
            help: "Permite os usuários a verem no canal.",
            aliase: ["unhide"],
            type: "admin",
        })
    }

    async execute(client, msg, args) {

        const { cor } = client
        try {
            await msg.channel.permissionOverwrites.edit(msg.guild.id, { VIEW_CHANNEL: true })
            msg.delete().catch(() => { })
            const embed = new MessageEmbed()
                .setColor(cor)
                .setDescription(`>>> 🔓| Este canal foi desbloqueado de ser visto por **${msg.author.tag}**.`)
            msg.channel.send({ embeds: [embed] })

        } catch (e) { msg.channel.send(`\`${e}\``) }
    }
}

module.exports = CommandUnhideChannel