module.exports = {
    name: "ping",
    help: "Exibe o ping",
    type: "others",
    aliase: [],
    execute: async (client, msg, args, cor) => {
        try {
            const msgInicial = await msg.channel.send('🏓 Pong')
            const pingApi = Math.abs(msgInicial.createdTimestamp - Date.now())
            msgInicial.edit(`**🏓 Pong! <@${msg.author.id}>\n  📡 Ping da Api: ${pingApi}ms.\n  📡 Ping do Bot: ${client.ws.ping}ms.**`)
        } catch (e) { return msg.channel.send(`\`${e}\``).catch(() => { }) }
    }
};