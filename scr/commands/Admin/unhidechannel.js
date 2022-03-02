module.exports = {
    name: "unhidechannel",
    help: "Permite os usuários a verem no canal.",
    aliase: ["unhide"],
    type: "admin",
    execute: async (client, msg, args, cor) => {

        try {

            await msg.channel.permissionOverwrites.edit(msg.guild.id, { VIEW_CHANNEL: true })
            msg.channel.send(`🔓| Este canal foi desbloqueado de ser visto por **${msg.author.tag}.**`)


        } catch (e) { msg.channel.send(`\`${e}\``) }
    }
}

