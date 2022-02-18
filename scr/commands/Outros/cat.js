const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');

module.exports = {
    name: "cat",
    help: "Exibe a foto de um gatinho",
    type: "fun",
    aliase: [],
    execute: async (client, msg, args, cor) => {
        try {
            const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setTitle('Gatos Supremacy 💖')
                .setImage(file)
            return msg.channel.send({ embeds: [helpMsg] })

        } catch (e) { return msg.channel.send(`\`${e}\``) }

    }
};