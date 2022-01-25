
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('back-music')
    .setDescription('Volta para a música tocada anteriomente.')

module.exports = {
    name: 'back-music',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    music: true,
    execute: async (client, interaction, cor) => {

        const { playSong } = client.music
        const queue = client.queues.get(interaction.guild.id);

        if (!queue || !queue.back) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Erro: `, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Não existe músicas para voltar.')
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        const song = queue.back
        let url = song.url
        let x = queue.songs.shift()
        queue.songs.unshift(song)

        playSong(client, interaction, song)

        queue.back = x
        client.queues.set(interaction.guild.id, queue);

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setDescription(`[${song.title}](${url}) [${song.durationFormatted}]`)
            .setAuthor({ name: '| ⏪ Retornada:', iconURL: interaction.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: false })

      
    }
}












