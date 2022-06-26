const { Client, Intents, Collection, } = require('discord.js');

const settings = {
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
}

class customClient extends Client {

    constructor() {
        super(settings)
        this.queues = new Collection()
        this.commands = new Collection()
        this.cooldown = new Map()
        this.prefix = '+'
        this.cor = '#4B0082'
        this.music = require('../classes/musicSettings')
    }

    async startBot(){
        super.login(process.env.TOKEN)
    }

}

module.exports = customClient
