const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const Command = require('../../classes/command')


class CommandCat extends Command {
    constructor() {
        super({
            name: "cat",
            help: "Exibe a foto de um gatinho",
            type: "fun",
            aliase: [],
        })
    }

    async execute(client, msg, args) {
        
        try {
            const { cor } = client
            const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setTitle('Gatos Supremacy 💖')
                .setImage(file)
                .setAuthor({ name: `| ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() })
                .setFooter({ text: "Gatos > Cachorros apenas..." })
            return msg.channel.send({ embeds: [helpMsg] })

        } catch (e) { return msg.channel.send(`\`${e}\``) }
    }

}

module.exports = CommandCat