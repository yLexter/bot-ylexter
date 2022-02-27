module.exports = {
    name: "unlock",
    help: "Permite os usuários a voltarem a enviarem mensagem no canal.",
    aliase: [],
    type: "admin",
    execute: async (client, msg, args, cor) => {

        try {

            await msg.channel.permissionOverwrites.edit(msg.guild.id, { SEND_MESSAGES: false })
            msg.channel.send(`🔓| Este canal foi desbloqueado por **${msg.author.tag}.**`)


        } catch (e) { msg.channel.send(`\`${e}\``) }
    }
}

