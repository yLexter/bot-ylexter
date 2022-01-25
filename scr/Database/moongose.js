
const mongoose = require('mongoose');
const modelGuild = require("./Shemas/Guild")
const modelUser = require("./Shemas/user.js")

const fecthGuild = async (client, msg, args = null) => {

    try {
        const guild = await modelGuild.findOne({ id: msg.guild.id })

        if (guild) {
            return {
                "dados": guild,
                "modelo": modelGuild
            }
        } else {
            const guild = await modelGuild.create({ id: msg.guild.id })
                .catch(e => { msg.channel.send('Ocorreu um Erro , tente novamente.') })
            await guild.save().catch(err => console.log(err));
            return {
                "dados": guild,
                "modelo": modelGuild
            }
        }

    } catch (e) { return console.log(e) }

}

const fecthUser = async (client, msg, args = null) => {

    try {
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
            }).catch(e => { msg.channel.send('Ocorreu um Erro , tente novamente.') })
            await user.save().catch(err => console.log(err))

            return {
                "dados": user,
                "modelo": modelUser
            }
        }

    } catch (e) { return console.log(e) }
}





module.exports = {
    fecthGuild,
    fecthUser
}






