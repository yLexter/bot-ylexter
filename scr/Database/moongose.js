const mongoose = require('mongoose');

class DatabaseClass {

    constructor() {
        this.guild = require("./Shemas/Guild")
        this.user = require("./Shemas/user")
        this.client = require('./Shemas/client')
    }

    connect() {
        mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true })
            .then(() => { console.log('Database Conectada') })
            .catch(e => { console.log(`Erro Ao conectar a database: ${e}`) })
    }

    async fecthGuild(client, msg) {

        const findGuild = await this.guild.findOne({ id: msg.guild.id })

        if (findGuild) return findGuild;

        const newGuild = await this.guild.create({ id: msg.guild.id })

        await newGuild.save()

        return newGuild

    }

    async fecthUser(client, msg) {

        const findUser = await this.user.findOne({ id: `${msg.author.id}` })

        if (findUser) return findUser;

        const newUser = await this.user.create({
            id: `${msg.author.id}`,
            username: msg.author.username,
        })

        await newUser.save()

        return newUser;

    }

    async createClient(client) {
        const clientModel = await this.client.create({
            id: `${client.user.id}`,
        })
        await clientModel.save()
    }
}

const Database = new DatabaseClass();

module.exports = Database






