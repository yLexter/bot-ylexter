const { MessageEmbed, Permissions } = require("discord.js");
const cor = '#4B0082'

module.exports = {
    name: 'interactionCreate',
    once: false,
    execute: async (client, interaction) => {

        const commands = client.slashs
        const command = commands.get(interaction.commandName)
        if (!command) return;

        const Member = interaction.guild.members.cache.get(interaction.user.id)
        const verify = command.permissions.some(x => Member.permissions.toArray().includes(x))

        if (!verify) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Você não tem permissão para executar este comando.`, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: true }).catch(() => { })
        }

        if (command.music) {            
            const { dados } = await client.db.fecthGuild(client, interaction)
            const queue = client.queues.get(interaction.guild.id);
            const idChannel = dados.channelMusic || null

            if (!idChannel || idChannel == interaction.guild.id) {
                function msgError() {
                    const helpMsg = new MessageEmbed()
                        .setColor(cor)
                        .setAuthor({ name: `| ❌ Comando só permitido aos membros que estão no voice com o bot.`, iconURL: interaction.user.displayAvatarURL() })
                    return interaction.reply({ embeds: [helpMsg], ephemeral: true })
                }

                return !queue ? executeCommand() :
                queue.connection.joinConfig.channelId == Member.voice.channel.id ?
                executeCommand() : msgError()
                
            } else {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ❌ Erro:`, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`Esse comando só é permitido no canal <#${idChannel}>`)
                return interaction.reply({ embeds: [helpMsg], ephemeral: true })
            }
        }


        executeCommand()

        async function executeCommand() {
            try {
                await command.execute(client, interaction, cor);
            } catch (error) {
                console.error(error);
                interaction.reply({ content: 'Erro ao Executar o Comando.', ephemeral: true }).catch(() => { })
            }
        }
        
    }
}
