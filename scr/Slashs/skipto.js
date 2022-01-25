
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('skipto')
    .setDescription('Avança para a música desejada')
    .addNumberOption(option => option.setName('número').setDescription('Digite o número referente a posição da música.').setRequired(true))

module.exports = {
    name: 'skipto',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    music: true,
    execute: async (client, interaction, cor) => {

        const { backMusic , playSong } = client.music
        const queue = client.queues.get(interaction.guild.id);
        const number = Math.floor(interaction.options.getNumber('número'))

        if (!queue) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Erro `, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Não existe músicas sendo tocada.')
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        const skipTo = queue.songs[number]

        if (!skipTo || number <= 1) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Não Existe essa Música para ser Skipada. `, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        if (!queue.loop) {
            const firstMusic = queue.songs[number]
            backMusic(client, interaction)
            queue.songs.splice(number - 1, 1)
            queue.songs.unshift(firstMusic)
            client.queues.set(interaction.guild.id, queue)
            const song = queue.songs[0]
            playSong(client, interaction, song);
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(`[${song.title}](${song.url}) [${song.durationFormatted}]`)
                .setAuthor({ name: `| ⏯️ Skipped `, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: false })
        } else {
            const song = queue.songs[0]
            playSong(client, interaction, song);
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(`[${song.title}](${song.url}) [${song.durationFormatted}]`)
                .setAuthor({ name: `| ⏯️ Skipped `, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: false })
        }
    }
}












