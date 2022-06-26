const Database = require('./../Database/moongose')
const play = require('play-dl')

module.exports = {
    name: 'ready',
    once: true,
    execute: async (client) => {

        console.log(`o bot ${client.user.username} está online`)
        client.user.setActivity(`Darius Jogando | ${client.prefix}Help`, { type: 'WATCHING' })
        Database.connect()

        play.getFreeClientID().then((clientID) => {
            play.setToken({
                soundcloud: {
                    client_id: clientID
                }
            })
        }).catch(e => { console.log(e) })

    }
}