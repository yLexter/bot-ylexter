

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const Youtube = require("youtube-sr").default;
const lyricsFinder = require('lyrics-finder');

const data = new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Procura a lyrics de uma música')
    .addStringOption(option => option.setName('musica').setDescription('Digite o nome da música desejada.').setRequired(true))

module.exports = {
    name: 'lyrics',
    data: data,
    music: false,
    permissions: ["USE_APPLICATION_COMMANDS"],
    execute: async (client, interaction, cor) => {

        const { titulo_formatado } = client.music
        const music = interaction.options.getString('musica')

        const msgLyrics = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: `| 🔎 Procurando Lyrics...`, iconURL: interaction.user.displayAvatarURL() })
        await interaction.reply({ embeds: [msgLyrics], ephemeral: true })


        let lyrics = await lyricsFinder('', music)

        if (!lyrics || lyrics == "") {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `Lyrics não encontrada.`, iconURL: interaction.user.displayAvatarURL() })
            return interaction.editReply({ embeds: [helpMsg], ephemeral: true })
        }
        let titulo
        let busca = await Youtube.searchOne(`${music}`)

        if (!busca) {
            titulo = `Lyrics`
        } else {
            titulo = titulo_formatado(busca.title)
        }

        if (lyrics.length > 6000) {
            lyrics = lyrics.substring(0, 4000)
        }

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setTitle(titulo)
            .setDescription(lyrics)
        return interaction.editReply({ embeds: [helpMsg], ephemeral: true })
    }
}












