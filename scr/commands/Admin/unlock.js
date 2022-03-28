const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "unlock",
    help: "Permite os usuários a voltarem a enviarem mensagem no canal.",
    aliase: [],
    type: "admin",
    execute: async (client, msg, args, cor) => {

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

