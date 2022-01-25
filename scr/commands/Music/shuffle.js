module.exports = {
    name: "shuffle",
    help: "Embaralha a queue atual",
    type: 'music',
    aliase: ["sh"],
    execute: async (client, msg, args, cor) => {

        const { MessageEmbed } = require("discord.js");
        const { stopMusic } = client.music

        try {
            
            const queue = client.queues.get(msg.guild.id);
            if (!queue || queue.songs.length < 2 ) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription('Não existe músicas na queue ou quantidade de músicas menor que 3')
                    .setAuthor({name: `| ❌  Erro`, iconURL: msg.author.displayAvatarURL()})
                    msg.channel.send({ embeds: [helpMsg] })
            }

            const firstMusic = queue.songs.shift()
            var backup = queue.songs
            var numeros = []

            while (true) {
                var shuffle = Math.floor(Math.random() * queue.songs.length)
                if (numeros.indexOf(shuffle) == -1) {
                    numeros.push(shuffle)
                } else if (queue.songs.length == numeros.length) break;
            }

            queue.songs = []

            await numeros.forEach((element) => {
                queue.songs.push(backup[element])
                client.queues.set(msg.guild.id, queue)
            });

            queue.songs.unshift(firstMusic)
            client.queues.set(msg.guild.id, queue)

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({name: `| 🔀 Queue Embaralhada`, iconURL: msg.author.displayAvatarURL()})
                msg.channel.send({ embeds: [helpMsg] })

        } catch (e) { stopMusic(client, msg , cor), msg.channel.send(`\`${e}\``) }

    }
};
