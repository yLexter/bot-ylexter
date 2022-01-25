
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Para a reprodução de música.')

module.exports = {
    name: 'stop',
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

        if (queue.connection) queue.connection.destroy();
        client.queues.delete(interaction.guild.id)
        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: ' | ⏹️ Stopped queue ', iconURL: client.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: false })
    }
}












