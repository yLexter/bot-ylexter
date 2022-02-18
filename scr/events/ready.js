const mongoose = require('mongoose');
const Database = require('./../Database/moongose')
// De Darius | ${prefix}Help
module.exports = {
    name: 'ready',
    once: true,
    execute: async (client) => {

    console.log(`o bot ${client.user.username} está online`)
    client.user.setActivity(`Darius Jogando | ${process.env.PREFIX}Help` , {type: 'WATCHING'})
    Database.connect()

    }
}