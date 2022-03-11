const mongoose = require('mongoose');

class DatabaseClass {

    constructor() {
        this.modelGuild = require("./Shemas/Guild")
        this.modelUser = require("./Shemas/user.js")
    }


    connect() {
        mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true })
            .then(() => { console.log('Database Conectada') })
            .catch(e => { console.log(`Erro Ao conectar a database: ${e}`) })
    }

    async fecthGuild(client, msg) {

        const guild = await this.modelGuild.findOne({ id: msg.guild.id })

        if (guild) {
            return {
                "dados": guild,
                "modelo": this.modelGuild
            }
        } else {
            const guild = await this.modelGuild.create({ id: msg.guild.id })
            await guild.save()
            return {
                "dados": guild,
                "modelo": this.modelGuild
            }
        }

    }

    async fecthUser(client, msg) {

        const user = await this.modelUser.findOne({ id: `${msg.guild.id}-${msg.author.id}` })

        if (user) {
            return {
                "dados": user,
                "modelo": this.modelUser
            }

        } else {
            const user = await this.modelUser.create({
                id: `${msg.guild.id}-${msg.author.id}`,
                username: msg.author.username,
                guildId: msg.guild.id
            })
            await user.save()

            return {
                "dados": user,
                "modelo": this.modelUser
            }
        }
    }
}

const Database = new DatabaseClass();

module.exports = Database






