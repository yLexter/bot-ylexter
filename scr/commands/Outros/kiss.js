module.exports = {
    name: "kiss",
    help: "Exibe um mensagem de beijo com alguem aleatório(mucho cringe)",
    type: "others",
    aliase: [],
    execute: async (client, msg, args, cor) => {

        const { MessageEmbed, MessageCollector } = require("discord.js");
        const fetch = require('node-fetch');

        try {
            const type = 'sfw'
            const category = 'kiss'
            const imageKiss = await fetch(`https://api.waifu.pics/${type}/${category}`).then(response => response.json())
            const porcetagem = Math.floor(Math.random() * 101)

            const allUsers = msg.guild.members.cache.map(x => { return x.user.id })
            const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]

            if (msg.author.id == randomUser) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setImage('https://c.tenor.com/f5ciSptgjFoAAAAS/draven-league-of-legends.gif')
                    .setDescription(`Parabéns!\nVocê tem o Narcisimo do Draven e só pode se Beijar a si Mesmo.`)
                return msg.channel.send({ embeds: [helpMsg] })
            }

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setImage(imageKiss.url)
                .setDescription(`O <@${msg.author.id}> tem ${porcetagem}% de Beijar o <@${randomUser}>.`)
            return msg.channel.send({ embeds: [helpMsg] })

        } catch (e) { return msg.channel.send(`\`${e}\``) }

    }
};