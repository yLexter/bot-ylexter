const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "unhidechannel",
    help: "Permite os usuários a verem no canal.",
    aliase: ["unhide"],
    type: "admin",
    execute: async (client, msg, args, cor) => {

        try {
            await msg.channel.permissionOverwrites.edit(msg.guild.id, { VIEW_CHANNEL: true })
            msg.delete().catch(() => {})
            const embed = new MessageEmbed()
                .setColor(cor)
                .setDescription(`>>> 🔓| Este canal foi desbloqueado de ser visto por **${msg.author.tag}**.`)
            msg.channel.send({ embeds: [embed] })

        } catch (e) { msg.channel.send(`\`${e}\``) }
    }
}

