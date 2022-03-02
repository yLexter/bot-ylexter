module.exports = {
    name: "lock",
    help: "Impede os usuários de enviarem mensagem no canal.",
    aliase: [],
    type: "admin",
    execute: async (client, msg, args, cor) => {

        try {

            await msg.channel.permissionOverwrites.edit(msg.guild.id, { SEND_MESSAGES: false })
            msg.channel.send(`🔒| Este canal foi bloqueado por **${msg.author.tag}.**`)


        } catch (e) { msg.channel.send(`\`${e}\``) }
    }
}

