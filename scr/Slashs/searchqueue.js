
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('search-queue')
    .setDescription('Procura por uma música da queue.')
    .addStringOption(option => option.setName('musica').setDescription('Digite o nome da música que procura.').setRequired(true))

module.exports = {
    name: 'searchqueue',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    music: true,
    execute: async (client, interaction, cor) => {

        const formatar = (string) => {
            return string
                .replaceAll(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]+/g, '')
                .toLowerCase()
        }

        const queue = client.queues.get(interaction.guild.id);

        if (!queue) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Erro `, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Não existe músicas sendo tocada.')
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        const music = interaction.options.getString('musica')
        const s = formatar(music)
        let string = ''
        let resultado10 = []

        let titulos = queue.songs.map((element, index) => {
            let titulo_formated = formatar(element.title)
            let musica = queue.songs[index]
            if (titulo_formated.includes(s)) resultado10.push(`**${index}**. [${musica.title}](${musica.url}) [${musica.durationFormatted}]`)
        });

        for (i = 0; i < resultado10.length; i++) {
            string += `${resultado10[i]}\n`
            if (i == 16) break;
        }

        if (resultado10.length == 0) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ No Result Found.`, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        } else {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(string)
                .setAuthor({ name: `| 🔎 Possíveis Resultados `, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

    }
}












