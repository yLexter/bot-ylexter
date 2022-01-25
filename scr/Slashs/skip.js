
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skipa para próxima música.')

module.exports = {
    name: 'skip',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    music: true,
    execute: async (client, interaction, cor) => {

        const { backMusic , playSong } = client.music
        const queue = client.queues.get(interaction.guild.id);

        if (!queue) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Erro `, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Não existe músicas sendo tocada.')
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        if (!queue.loop) backMusic(client, interaction), client.queues.set(interaction.guild.id, queue);
        let song = queue.songs[0]
        playSong(client, interaction, song);

        if (queue.songs.length > 0) {
            let url = song.url
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(`[${song.title}](${url}) [${song.durationFormatted}]`)
                .setAuthor({ name: `| ⏯️ Skipped `, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: false })
        } else interaction.reply({content: 'As músicas acabaram.' , ephemeral: true })
    }
}












