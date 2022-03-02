module.exports = {
    name: "hidechannel",
    help: "Esconde o canal dos usuários",
    aliase: ["hide"],
    type: "admin",
    execute: async (client, msg, args, cor) => {

        try {

            await msg.channel.permissionOverwrites.edit(msg.guild.id, { VIEW_CHANNEL: false })
            msg.channel.send(`🔒| Este canal foi bloqueado de ser visto por **${msg.author.tag}.**`)


        } catch (e) { msg.channel.send(`\`${e}\``) }
    }
}

