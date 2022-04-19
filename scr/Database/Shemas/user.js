const mongoose = require('mongoose');

const schemaUser = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    xp: {
        type: Number,
        default: 1000
    },
    minigames: {
        type: Object,

        default: {}
    },

    outros: Array,
    customPlaylist: Array
})

module.exports = mongoose.model('users', schemaUser)
