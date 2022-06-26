const fs = require('fs')
const path = require('path')

module.exports = (client) => {

    const commandFiles = fs.readdirSync(path.join(__dirname, "../commands"))

    for (let filename of commandFiles) {

        const stat = fs.statSync(`./scr/commands/${filename}`)

        if (stat.isDirectory()) {
            const commands2 = fs.readdirSync(path.join(__dirname, `../commands/${filename}`)).filter(file => file.endsWith('.js'))
            commands2.forEach(element => {
                const readCommand = require(`../commands/${filename}/${element}`);
                const command = new readCommand()
                client.commands.set(command.name, command);
            })
        }
    }

    console.log('Comandos lidos com sucesso.')
}
