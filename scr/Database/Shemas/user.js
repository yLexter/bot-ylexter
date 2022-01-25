const mongoose = require('mongoose');

const schemaUser = new mongoose.Schema({

    id: {
        type: String,
        required: true
    },

    guildId: {
        type: String,
        required: true
    },

    username: String,
    
    warns: {
        type: Array,
        default: []
    },

    xp: {
        type: Number,
        default: 1000
    },

    minigames: {
        type: Array,
        default: []
    },

    outros: {
        type: Array
        , default: []
    }
})

module.exports = mongoose.model('users', schemaUser)
