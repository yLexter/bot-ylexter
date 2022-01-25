const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} = require('@discordjs/voice');

const Youtube = require("youtube-sr").default;
const play = require('play-dl')

const data = new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Avança ou retrocede para minutagem desejada.')
    .addStringOption(option => option.setName('minutagem').setDescription('Insira a minutagem , ex: 02:15').setRequired(true))

module.exports = {
    name: 'seek',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    music: true,
    execute: async (client, interaction, cor) => {

        const queue = client.queues.get(interaction.guild.id);
        const minutagem = interaction.options.getString('minutagem')
        const { textToSeconds } = client.music

        if (!queue) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Erro `, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Não existe músicas sendo tocada.')
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        try {

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Seeking... `, iconURL: interaction.user.displayAvatarURL() })
           await interaction.reply({ embeds: [helpMsg], ephemeral: false })

            var secondsFinal = await textToSeconds(minutagem)
            const song = queue.songs[0]

            if (secondsFinal >= song.duration / 1000) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| Valor maior que a duração da Música.`, iconURL: interaction.user.displayAvatarURL() })
                return interaction.editReply({ embeds: [helpMsg], ephemeral: false })
            }

            const stream = await play.stream(song.id, { seek: secondsFinal, quality: 3 })
            const resource = await createAudioResource(stream.stream, { inputType: StreamType.Opus });
            queue.dispatcher.play(resource);
            queue.connection.subscribe(queue.dispatcher)

        } catch (e) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .addField('Observação', 'Para que não ocorra Erros , use 5s a 10s da minutagem final do vídeo.')
                .setAuthor({ name: `| Informe Corretamente => HH:MM:SS`, iconURL: interaction.user.displayAvatarURL() })
            return interaction.editReply({ embeds: [helpMsg], ephemeral: false })
        }

    }
}












