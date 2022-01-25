
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Embaralha a queue atual')

module.exports = {
    name: 'shuffle',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    music: true,
    execute: async (client, interaction, cor) => {

        const queue = client.queues.get(interaction.guild.id);

        if (!queue || queue.songs.length < 2) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Erro `, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Não existe músicas sendo tocada ou Músicas insuficientes.')
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        const firstMusic = queue.songs.shift()
        var backup = queue.songs
        var numeros = []

        while (true) {
            var shuffle = Math.floor(Math.random() * queue.songs.length)
            if (numeros.indexOf(shuffle) == -1) {
                numeros.push(shuffle)
            } else if (queue.songs.length == numeros.length) break;
        }

        queue.songs = []

        await numeros.forEach((element) => {
            queue.songs.push(backup[element])
        });

        queue.songs.unshift(firstMusic)
        client.queues.set(interaction.guild.id , queue)

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: `| 🔀 Queue Embaralhada`, iconURL: interaction.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: false })

    }
}












