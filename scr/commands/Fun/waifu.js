const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const Command = require('../../classes/command')

class CommandSay extends Command {
    constructor() {
        super({
            name: "waifu",
            help: "Mostra uma waifu aleatória",
            type: 'fun',
            cooldown: 8,
            aliase: [],
        })
    }

    async execute(client, msg, args) {
        try {
            const { cor } = client
            const { url } = await fetch('https://api.waifu.pics/sfw/waifu').then(response => response.json())
            const randomNumero = Math.floor(Math.random() * 101)
            const footer = randomNumero > 50 ? `${randomNumero}%, Que Sorte hein... Já Pode Jogar Na Loteria.` : `Que Azar hein...  Só ${randomNumero}% kk.`

            const embed = new MessageEmbed()
                .setImage(url)
                .setColor(cor)
                .setDescription(`Você tem ${randomNumero}% de chance de ficar com essa waifu.`)
                .setAuthor({ name: `| ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() })
                .setFooter({ text: `${footer}` })
            return msg.channel.send({ embeds: [embed] })

        } catch (e) {
            msg.channel.send(`\`${e}\``)
        }
    }
}

module.exports = CommandSay
