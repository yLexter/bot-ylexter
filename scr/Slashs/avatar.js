

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
      .setName('avatar')
      .setDescription('Mostra o avatar de um user')
      .addUserOption(option => option.setName('user').setDescription('Selecione um User.').setRequired(true))

module.exports = {
      name: 'avatar',
      data: data,
      permissions: ["USE_APPLICATION_COMMANDS"],
      execute: (client, interaction , cor) => {

            const userSc = interaction.options.getUser('user')
            const { username , discriminator} = userSc

            const msgAvatar = new MessageEmbed()
                  .setColor(cor)
                  .setTitle(`Avatar de ${username}#${discriminator}`)
                  .setDescription(`[Link do Avatar](${userSc.displayAvatarURL({ dynamic: true, size: 1024 })})`)
                  .setImage(userSc.displayAvatarURL({ dynamic: true, size: 1024 }))
            interaction.reply({ embeds: [msgAvatar], ephemeral: true })
      }
}











