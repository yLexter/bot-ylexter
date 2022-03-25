const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "lock",
    help: "Impede os usuários de enviarem mensagem no canal.",
    usage: '<Comando> + <Motivo [Opcional]>',
    aliase: [],
    type: "admin",
    execute: async (client, msg, args, cor) => {

        try {
            const reason = args.join(' ') || 'Não Informado.'
            await msg.channel.permissionOverwrites.edit(msg.guild.id, { SEND_MESSAGES: false })
            const embed = new MessageEmbed()
                .setColor(cor)
                .setDescription(`>>> 🔒| Este canal foi bloqueado por **${msg.author.tag}.**\nMotivo \`${reason}\``)
            msg.channel.send({ embeds: [embed] })

        } catch (e) { msg.channel.send(`\`${e}\``) }
    }
}

