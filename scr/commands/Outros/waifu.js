const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');

module.exports = {
    name: "waifu",
    help: "Mostra uma waifu aleatória",
    type: 'fun',
    aliase: [],
    execute: async (client, msg, args, cor) => {

        try {
            const { url } = await fetch('https://api.waifu.pics/sfw/waifu').then(response => response.json())
            const randomNumero = Math.floor(Math.random() * 101)
            const footer = randomNumero > 50 ? `${randomNumero}%, Que Sorte hein... Já Pode Jogar Na Loteria.` : `Que Azar hein...  Só ${randomNumero}% kk.`

            const embed = new MessageEmbed()
                .setImage(url)
                .setColor(cor)
                .setTitle(`Você tem ${randomNumero}% de Chance de Ficar com essa Waifu.`)
                .setAuthor({ name: `| ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() })
                .setFooter({ text: `${footer}` })
            return msg.channel.send({ embeds: [embed] })

        } catch (e) {
            msg.channel.send(`\`${e}\``)
        }
    }
}

