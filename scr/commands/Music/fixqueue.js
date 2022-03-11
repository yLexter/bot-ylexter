const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "fixqueue",
    help: "Deleta a queue atual e destroi a conexão do bot.",
    type: 'music',
    aliase: [],
    execute: (client, msg, args, cor) => {

        const { stopMusic, playSong } = client.music

        try {

            const queue = client.queues.get(msg.guild.id);

            if (!queue) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ❌ Não Existe músicas tocando.`, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            queue.connection.destroy();
            client.queues.delete(msg.guild.id)


            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Queue fixada com sucesso.`, iconURL: msg.author.displayAvatarURL() })
            return msg.channel.send({ embeds: [helpMsg] })

        } catch (e) { stopMusic(client, msg, cor), msg.channel.send(`\`${e}\``) }
    }
}; // Execute end

