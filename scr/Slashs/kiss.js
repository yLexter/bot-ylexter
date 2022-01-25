
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');

const data = new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('Mostra alguém aleatório que você bejaria.')

module.exports = {
    name: 'kiss',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    execute: async (client, interaction, cor) => {

        const type = 'sfw'
        const category = 'kiss'
        const imageKiss = await fetch(`https://api.waifu.pics/${type}/${category}`).then(response => response.json())
        const porcetagem = Math.floor(Math.random() * 101)

        const allUsers = interaction.guild.members.cache.map(x => { return x.user.id })

        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]

        if (interaction.user.id == randomUser) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setImage('https://c.tenor.com/f5ciSptgjFoAAAAS/draven-league-of-legends.gif')
                .setDescription(`Parabéns!\nVocê tem o Narcisimo do Draven e só pode se Beijar a si Mesmo.`)
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setImage(imageKiss.url)
            .setDescription(`Você tem ${porcetagem}% de Beijar o <@${randomUser}>.`)
        return interaction.reply({ embeds: [helpMsg], ephemeral: true })
    }
}












