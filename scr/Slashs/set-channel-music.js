
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require("discord.js");
const mongoose = require('mongoose');

const data = new SlashCommandBuilder()
    .setName('set-channel-music')
    .setDescription('Seta um canal para ser o canal de música.')
    .addChannelOption(option => option.setName('channel').setDescription('Selecione um canal de Texto').setRequired(true))

module.exports = {
    name: 'set-channel-music',
    data: data,
    permissions: ["ADMINISTRATOR" , "USE_APPLICATION_COMMANDS"],
    execute: async (client, interaction, cor) => {

        const { modelo, dados } = await client.db.fecthGuild(client, interaction)
        const channel = interaction.options.getChannel('channel')

        if (channel.type != 'GUILD_TEXT') {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Você só pode escolher canais de textos.`, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        await modelo.findOneAndUpdate({ id: interaction.guild.id }, { channelMusic: channel.id })

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setDescription(`O Canal de música foi setado para: <#${channel.id}>`)
            .setAuthor({ name: `| ✔️ Sucesso `, iconURL: interaction.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: true })
    }
}











