
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Deixa a música atual em loop')

module.exports = {
    name: 'loop',
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

        var looping = !queue.loop ? true : false;
        looping ? queue.loop = true : queue.loop = null;
        var loopingatual = queue.loop ? 'Ativado.' : 'Desativado.'
        client.queues.set(interaction.guild.id , queue)

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: `| ♾️ O Loop foi ${loopingatual} `, iconURL: interaction.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: false })

    }
}












