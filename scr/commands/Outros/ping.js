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
            const pingApi = Date.now() - msg.createdTimestamp
            msg.channel.send(`**🏓 Pong! <@${msg.author.id}>\n  📡 Ping da Api: ${pingApi}ms.\n  📡 Ping do Bot: ${client.ws.ping}ms.**`)
      
        } catch (e) { return msg.channel.send(`\`${e}\``).catch(() => { }) }
    }
}

module.exports = CommandPing
