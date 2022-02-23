
const mongoose = require('mongoose');
const modelGuild = require("./Shemas/Guild")
const modelUser = require("./Shemas/user.js")

class DatabaseClass {

    connect() {
        mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true })
            .then(() => { console.log('Database Conectada') })
            .catch(e => { console.log(`Erro Ao conectar a database: ${e}`) })
    }

    async fecthGuild(client, msg) {

        const guild = await modelGuild.findOne({ id: msg.guild.id })

        if (guild) {
            return {
                "dados": guild,
                "modelo": modelGuild
            }
        } else {
            const guild = await modelGuild.create({ id: msg.guild.id })
            await guild.save()
            return {
                "dados": guild,
                "modelo": modelGuild
            }
        }

    }

    async fecthUser(client, msg) {

        const user = await modelUser.findOne({ id: `${msg.guild.id}-${msg.author.id}` })

        if (user) {
            return {
                "dados": user,
                "modelo": modelUser
            }

        } else {
            const user = await modelUser.create({
                id: `${msg.guild.id}-${msg.author.id}`,
                username: msg.author.username,
                guildId: msg.guild.id
            })
            await user.save()

            return {
                "dados": user,
                "modelo": modelUser
            }
        }
    }
}

const Database = new DatabaseClass();

module.exports = Database






