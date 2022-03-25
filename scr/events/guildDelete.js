const mongoose = require('mongoose');
const Database = require('./../Database/moongose')

module.exports = {
    name: 'guildDelete',
    once: false,
    execute: async (client, guild) => {

        try {
            await Database.guild.findOneAndDelete({ id: guild.id })
        } catch (e) {
            console.log(e)
        }


    }
}