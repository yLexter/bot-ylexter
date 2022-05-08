const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "shuffle",
    help: "Embaralha a queue atual",
    type: 'music',
    aliase: ["sh"],
    execute: async (client, msg, args, cor) => {

        const { stop, shuffle } = client.music

        try {
            const queue = client.queues.get(msg.guild.id);
            const minimo = 3

            if (!queue || queue.songs.length <= minimo) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`Não existe músicas na queue ou quantidade de músicas menor que ${minimo}`)
                    .setAuthor({ name: `| ❌  Erro`, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            shuffle(client, msg)

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| 🔀 Queue Embaralhada`, iconURL: msg.author.displayAvatarURL() })
            msg.channel.send({ embeds: [helpMsg] })

        } catch (e) { stop(client, msg,), msg.channel.send(`\`${e}\``) }

    }
};
