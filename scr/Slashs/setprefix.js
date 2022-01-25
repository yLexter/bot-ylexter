const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
      .setName('setprefix')
      .setDescription('Mudar o prefix do bot. *Não inclui os comandos de / . ')
      .addStringOption(option => option.setName('prefix').setDescription('Insira Prefix menor que 4 caracteres que não começe com / ').setRequired(true))

module.exports = {
      name: 'setprefix',
      data: data,
      permissions: ["USE_APPLICATION_COMMANDS" , "ADMINISTRATOR"],
      execute: async (client, interaction, cor) => {

            const { modelo, dados } = await client.db.fecthGuild(client, interaction)
            const newPrefix = interaction.options.getString('prefix')

            if (newPrefix == dados.prefix || newPrefix.length > 3 || newPrefix.startsWith("/")) {
                  const helpMsg = new MessageEmbed()
                        .setColor(cor)
                        .setAuthor({ name: ` ❌ | Insira um prefix válido que não seja o atual ou não inicie com /`, iconURL: interaction.user.displayAvatarURL() })
                  return interaction.reply({ embeds: [helpMsg] , ephemeral: true })
            }

            await modelo.findOneAndUpdate({ id: interaction.guild.id }, { prefix: newPrefix })

            const helpMsg = new MessageEmbed()
                  .setColor(cor)
                  .setAuthor({ name: `| ✔️ | Prefixo mudado para: ${newPrefix} `, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg] , ephemeral: true })


      }
}