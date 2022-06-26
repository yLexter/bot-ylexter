const { MessageEmbed } = require("discord.js");
const { getVoiceConnection } = require('@discordjs/voice');
const Command = require('../../classes/command')

class CommadFixQueue extends Command {
    constructor() {
        super({
            name: "fixqueue",
            help: "Deleta a queue atual e destroi a conexão do bot.",
            type: 'others',
            aliase: [],
        })
    }

    async execute(client, msg, args) {

        const { cor } = client
        const { stop } = client.music

        try {

            const queue = client.queues.get(msg.guild.id);
            const conn = getVoiceConnection(msg.guild.id)

            if (!queue) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ❌ Não Existe músicas tocando.`, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            if (conn && conn.joinConfig.channelId != msg.member.voice.channel) {
                return msg.reply('Você não está no mesmo canl que voz doque eu!')
            }

            queue?.message.delete().catch(() => { })
            queue?.collector.stop()
            client.queues.delete(msg.guild.id)
            conn.destroy()

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Queue fixada com sucesso.`, iconURL: msg.author.displayAvatarURL() })
            return msg.channel.send({ embeds: [helpMsg] })

        } catch (e) { stop(client, msg, cor), msg.channel.send(`\`${e}\``) }

    }
}

module.exports = CommadFixQueue
