const Command = require('../../classes/command')

class CommandPing extends Command {
    constructor() {
        super({
            name: "ping",
            help: "Exibe o ping",
            type: "others",
            aliase: [],
        })
    }

    async execute(client, msg, args) {
        const { cor } = client

        try {
            const msgInicial = await msg.channel.send('🏓 Pong')
            const pingApi = Math.abs(msgInicial.createdTimestamp - Date.now())
            msgInicial.edit(`**🏓 Pong! <@${msg.author.id}>\n  📡 Ping da Api: ${pingApi}ms.\n  📡 Ping do Bot: ${client.ws.ping}ms.**`)
        } catch (e) { return msg.channel.send(`\`${e}\``).catch(() => { }) }
    }
}

module.exports = CommandPing
