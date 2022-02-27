const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "kiss",
    help: "Exibe um mensagem de beijo com alguem aleatório(mucho cringe)",
    type: "fun",
    aliase: [],
    execute: async (client, msg, args, cor) => {

        const fetch = require('node-fetch');

        try {
            const { url } = await fetch(`https://api.waifu.pics/sfw/kiss`).then(response => response.json())
            const porcetagem = Math.floor(Math.random() * 101)
            const allUsers = msg.guild.members.cache.map(x => { return x.user.id })
            const randomUser = (msg.mentions.members.first()).user.id || allUsers[Math.floor(Math.random() * allUsers.length)]
            const footer = porcetagem < 30 ? 'Eita... não combinam nem um pouco.' : porcetagem > 30 && porcetagem < 60 ? 'Quase, só falta um empurrãozinho.' : 'Temos um novo casal na área.'

            if (msg.author.id == randomUser) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setImage('https://c.tenor.com/f5ciSptgjFoAAAAS/draven-league-of-legends.gif')
                    .setDescription(`Você tem o Narcisimo do Draven e só pode se Beijar a si Mesmo.`)
                    .setTitle('Parabens!')
                    .setAuthor({ name: `| ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setImage(url)
                .setDescription(`O <@${msg.author.id}> tem ${porcetagem}% de Beijar o <@${randomUser}>.`)
                .setAuthor({ name: `| ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() })
                .setFooter({ text: `${footer}` })
            return msg.channel.send({ embeds: [helpMsg] })

        } catch (e) { return msg.channel.send(`\`${e}\``) }

    }
};