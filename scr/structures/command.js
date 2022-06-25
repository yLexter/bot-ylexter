const fs = require('fs')
const path = require('path')

module.exports = (client) => {

    const commandFiles = fs.readdirSync(path.join(__dirname, "./scr/commands"))

    for (let filename of commandFiles) {

        const stat = fs.statSync(`./scr/commands/${filename}`)

        if (stat.isDirectory()) {
            const commands2 = fs.readdirSync(path.join(__dirname, `./scr/commands/${filename}`)).filter(file => file.endsWith('.js'))
            commands2.forEach(element => {
                const command = require(`./scr/commands/${filename}/${element}`);
                client.commands.set(command.name, command);
            })
        }

    }
}