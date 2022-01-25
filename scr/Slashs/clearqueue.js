
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('clear-queue')
    .setDescription('Limpa as músicas da queue')

module.exports = {
    name: 'clear-queue',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    music: true,
    execute: async (client, interaction, cor) => {

        const queue = client.queues.get(interaction.guild.id);

        if (!queue) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Erro `, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Não existe músicas sendo tocada.')
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        const firstMusic = queue.songs[0]
        queue.songs = [];
        queue.songs.push(firstMusic)
        client.queues.set(interaction.guild.id , queue)

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: `| ✔️ Queue Limpa.`, iconURL: interaction.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: false })

    }
}












