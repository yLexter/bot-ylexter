
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('loopqueue')
    .setDescription('Deixa a queue atual em loop')

module.exports = {
    name: 'loopqueue',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    music: true,
    execute: async (client, interaction, cor) => {

        const queue = client.queues.get(interaction.guild.id);

        if (!queue || queue.songs.length <= 1) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Erro `, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Não existe músicas sendo tocada ou só existe uma música.')
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        const queueSaved = []
        for (x of queue.songs) {
            queueSaved.push(x)
        }

        var looping = !queue.loopQueue ? true : false;
        looping ? queue.loopQueue = queueSaved : queue.loopQueue = null;
        var loopingatual = queue.loopQueue ? 'Ativado.' : 'Desativado.'
        client.queues.set(interaction.guild.id, queue)

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: `| ♾️ O LoopQueue foi ${loopingatual} `, iconURL: interaction.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: false })

    }
}












