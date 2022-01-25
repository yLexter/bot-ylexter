
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require("discord.js");
const moment = require('moment');
const mongoose = require('mongoose');

const data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicka um usuário do servidor.')
    .addUserOption(option => option.setName('target').setDescription('Selecione um User.').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Motivo').setRequired(true))


module.exports = {
    name: 'kick',
    data: data,
    permissions: ["KICK_MEMBERS", "USE_APPLICATION_COMMANDS"],
    execute: async (client, interaction, cor) => {

        const { modelo, dados } = await client.db.fecthGuild(client, interaction)
        const local = moment.locale('pt-br');
        const dataBan = moment().format("LLLL")

        const userBanido = interaction.options.getUser('target');
        const memberBanido = interaction.guild.members.cache.get(userBanido.id)
        const authorCmd = interaction.guild.members.cache.get(interaction.user.id)
        const reason = interaction.options.getString('reason')

        if (interaction.user.id == memberBanido.user.id || memberBanido.user.id == client.user.id) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Você não pode se Kickar ou Kickar o propío Bot`, iconURL: interaction.user.displayAvatarURL() })
            return interaction.editReply({ embeds: [helpMsg], ephemeral: true, fecthReply: true, components: [] }).catch(() => { })
        }

       /*  try {
            await memberBanido.kick(`${reason}`)
        } catch (e) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Erro ao Kickar o User`, iconURL: interaction.user.displayAvatarURL() })
                .addFields({ name: 'Sem Permissão', value: 'Não tenho permissão Para Kickar o membro' },
                    { name: 'Role abaixo do user', value: 'Minha role possa estar abaixo do user ou em ultimo , suba ela para cima para que eu consigar kickar' },
                    { name: 'Cargo Superior', value: 'O User Informado possa ter mais cargo que eu.'
                    })
            return interaction.editReply({ embeds: [helpMsg], ephemeral: true }).catch(() => { })
        } */

        let objectBan = {
            logid: "kick",
            idGuild: `${interaction.guildId}-${memberBanido.user.id}`,
            autor: `${authorCmd.user.username}#${authorCmd.user.discriminator}`,
            nome: `${memberBanido.user.username}#${memberBanido.user.discriminator}`,
            id: memberBanido.user.id,
            motivo: reason,
            data: dataBan
        }

        const { autor, nome, motivo, id } = objectBan

        //  await modelo.findOneAndUpdate({ id: interaction.guildId }, { $push: { logs: objectBan } })

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setFields({ name: 'Author', value: `${autor}` },
                { name: 'Kickado', value: `${nome}` },
                { name: 'ID', value: `${id}` },
                { name: 'Motivo', value: `${motivo}` },
                { name: 'Data', value: `${dataBan}` })
            .setAuthor({ name: `| ✔️ | User Kickado `, iconURL: interaction.user.displayAvatarURL() })
        return interaction.reply({ embeds: [helpMsg], ephemeral: true })

    }
}











