
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require("discord.js");
const mongoose = require('mongoose');

const data = new SlashCommandBuilder()
    .setName('delete-channel-music')
    .setDescription('Remove o canal de música.')

module.exports = {
    name: 'delete-channel-music',
    data: data,
    permissions: ["ADMINISTRATOR" , "USE_APPLICATION_COMMANDS"],
    execute: async (client, interaction, cor) => {

        const { modelo, dados } = await client.db.fecthGuild(client, interaction)
        const channel = dados.channelMusic

        if (!channel) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Não existe um canal de música.`, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        await modelo.findOneAndUpdate({ id: interaction.guild.id }, { channelMusic: null })

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setDescription(`O Canal de música foi removido.`)
            .setAuthor({ name: `| ✔️ Sucesso `, iconURL: interaction.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: true })
    }
}











