const { MessageEmbed } = require("discord.js");

const Command = require('../../classes/command')

class CommandHideChannel extends Command {
    constructor() {
        super({
            name: "hidechannel",
            help: "Esconde o canal dos usuários",
            aliase: ["hide"],
            usage: '<Comando> + <Motivo [Opcional]>',
            type: "admin",
        })
    }

    async execute(client, msg, args) {

        const { cor } = client
        
        try {
            const reason = args.join(' ') || 'Não Informado.'
            await msg.channel.permissionOverwrites.edit(msg.guild.id, { VIEW_CHANNEL: false })
            msg.delete().catch(() => { })
            const embed = new MessageEmbed()
                .setColor(cor)
                .setDescription(`>>> 🔒| Este canal foi bloqueado de ser visto por **${msg.author.tag}.**\nMotivo \`${reason}\``)
            msg.channel.send({ embeds: [embed] })


        } catch (e) { msg.channel.send(`\`${e}\``) }
    }
}

module.exports = CommandHideChannel
