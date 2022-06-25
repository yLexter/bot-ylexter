const fs = require('fs')
const path = require('path')

module.exports = (client) => {

    const eventsFiles = fs.readdirSync("./scr/events")

    for (let eventFile of eventsFiles) {
        const evento = require(`./scr/events/${eventFile}`)
        if (evento.once) {
            client.once(evento.name, (...args) => evento.execute(client, ...args));
        } else {
            client.on(evento.name, (...args) => evento.execute(client, ...args));
        }
    }


}