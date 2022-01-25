const mongoose = require('mongoose');

const schemaGuild = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    prefix: {
        type: String,
        default: prefix
    },
    channelMusic: {
        type: String,
        default: null
    },
    logs: {
        type: Array,
        default: []
    },
 })

module.exports =  mongoose.model("guilds", schemaGuild)



