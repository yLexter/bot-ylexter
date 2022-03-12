const mongoose = require('mongoose');

const schemaClient = new mongoose.Schema({

    id: {
        type: String,
        required: true
    },

    blacklist: {
        Users: Array,
        Guilds: Array,
    },

    serverPremiuns: Array,
    commandsMan: Array
})

module.exports = mongoose.model("client", schemaClient)
