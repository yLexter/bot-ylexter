
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove uma musica da queue.')
    .addNumberOption(option => option.setName('número').setDescription('Digite o número referente a posição da música.').setRequired(true))

module.exports = {
    name: 'remove',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    music: true,
    execute: async (client, interaction, cor) => {

        const queue = client.queues.get(interaction.guild.id);
        const number = Math.floor(interaction.options.getNumber('número'))

        if (!queue) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Erro `, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Não existe músicas sendo tocada.')
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        const removeTo = queue.songs[number]

        if (!removeTo || number == 0) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Não Existe essa Música para ser Removida. `, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        let url = removeTo.url
        queue.songs.splice(number, 1)
        client.queues.set(interaction.guild.id, queue)

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setDescription(`[${removeTo.title}](${url}) [${removeTo.durationFormatted}]`)
            .setAuthor({ name: `| ✔️ Removida:`, iconURL: interaction.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: false })
    }
}












