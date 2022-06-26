const { MessageEmbed } = require("discord.js");

const Command = require('../../classes/command')

class CommandLock extends Command {
    constructor() {
        super({
            name: "lock",
            help: "Impede os usuários de enviarem mensagem no canal.",
            usage: '<Comando> + <Motivo [Opcional]>',
            aliase: [],
            type: "admin",
        })
    }

    async execute(client, msg, args) {

        const { cor } = client

        try {
            const reason = args.join(' ') || 'Não Informado.'
            await msg.channel.permissionOverwrites.edit(msg.guild.id, { SEND_MESSAGES: false })
            msg.delete().catch(() => { })
            const embed = new MessageEmbed()
                .setColor(cor)
                .setDescription(`>>> 🔒| Este canal foi bloqueado por **${msg.author.tag}.**\nMotivo \`${reason}\``)
            msg.channel.send({ embeds: [embed] })

        } catch (e) { msg.channel.send(`\`${e}\``) }
    }
}

module.exports = CommandLock


