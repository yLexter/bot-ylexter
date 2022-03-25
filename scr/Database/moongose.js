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

        const guild = await this.guild.findOne({ id: msg.guild.id })

        if (guild) {
            return {
                "dados": guild,
                "modelo": this.guild
            }
        } else {
            const guild = await this.guild.create({ id: msg.guild.id })
            await guild.save()
            return {
                "dados": guild,
                "modelo": this.guild
            }
        }

    }

    async fecthUser(client, msg) {

        const user = await this.user.findOne({ id: `${msg.guild.id}-${msg.author.id}` })

        if (user) {
            return {
                "dados": user,
                "modelo": this.user
            }

        } else {
            const user = await this.user.create({
                id: `${msg.guild.id}-${msg.author.id}`,
                username: msg.author.username,
                guildId: msg.guild.id
            })
            await user.save()

            return {
                "dados": user,
                "modelo": this.user
            }
        }
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






