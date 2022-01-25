
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Voltar a tocar a música.')

module.exports = {
    name: 'resume',
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

        if (queue.dispatcher._state.status == 'playing') {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: '| ⏹️ Música já está tocando.', iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: false })
        }

        queue.dispatcher.unpause();

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: '|  ▶️ Voltando a Tocar.', iconURL: interaction.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: false })

    }
}












