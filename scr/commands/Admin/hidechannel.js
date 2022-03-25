const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "hidechannel",
    help: "Esconde o canal dos usuários",
    aliase: ["hide"],
    usage: '<Comando> + <Motivo [Opcional]>',
    type: "admin",
    execute: async (client, msg, args, cor) => {

        try {
            const reason = args.join(' ') || 'Não Informado.'
            await msg.channel.permissionOverwrites.edit(msg.guild.id, { VIEW_CHANNEL: false })
            const embed = new MessageEmbed()
                .setColor(cor)
                .setDescription(`>>> 🔒| Este canal foi bloqueado de ser visto por **${msg.author.tag}.**\nMotivo \`${reason}\``)
            msg.channel.send({ embeds: [embed] })


        } catch (e) { msg.channel.send(`\`${e}\``) }
    }
}

