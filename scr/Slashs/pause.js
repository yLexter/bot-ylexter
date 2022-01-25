
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausa a música atual.')

module.exports = {
    name: 'pause',
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

        if (queue.dispatcher._state.status == 'paused') {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: '| ⏹️ Música já está pausada.', iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: false })
        }

        queue.dispatcher.pause()

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: '| ⏹️ Pausada.', iconURL: interaction.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: false })

    }
}












