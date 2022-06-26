const { MessageEmbed } = require("discord.js");
const Command = require('../../classes/command')

class CommandUnlock extends Command {
    constructor() {
        super({
            name: "unlock",
            help: "Permite os usuários a voltarem a enviarem mensagem no canal.",
            aliase: [],
            type: "admin",
        })
    }

    async execute(client, msg, args) {

        const { cor } = client
        try {
            await msg.channel.permissionOverwrites.edit(msg.guild.id, { SEND_MESSAGES: true })
            msg.delete().catch(() => {})
            const embed = new MessageEmbed()
                .setColor(cor)
                .setDescription(`>>> 🔓| Este canal foi desbloqueado por **${msg.author.tag}.**`)
            msg.channel.send({ embeds: [embed] })

        } catch (e) { msg.channel.send(`\`${e}\``) }        
    }
}

module.exports = CommandUnlock


