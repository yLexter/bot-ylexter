const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "move",
    help: "Move uma música para determinada posição da fila , Use 2 número , o que quer mover e a nova posição.",
    type: 'music',
    aliase: [],
    execute: async (client, msg, args, cor) => {

        const { stopMusic } = client.music

        try {
            const queue = client.queues.get(msg.guild.id);
            const posicaoSong = Math.floor(Number(args[0]))
            const newPosicaoSong = Math.floor(Number(args[1]))

            if (!queue || posicaoSong == 0 || isNaN(posicaoSong) || isNaN(newPosicaoSong) || !queue.songs[posicaoSong] || newPosicaoSong <= 0) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .addFields(
                        { name: "Queue", value: "Não existe músicas tocando atualmente." },
                        { name: "Parâmetro Inválido", value: "Nenhum parâmetro válido foi fornecido." },
                        { name: 'Números', value: 'Você só pode passar Números como parâmetro.' },
                        { name: 'Posição', value: 'Você não pode escolher 0 como parâmetro.' }
                    )
                    .setAuthor({ name: `| ❌ Possiveis Erros`, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            const songMovida = queue.songs.splice(posicaoSong, 1)[0]
            const verifyPosition = newPosicaoSong > queue.songs.length ? `última [${queue.songs.length}°]` : `${newPosicaoSong}°`

            queue.songs.splice(newPosicaoSong, 0, songMovida)
            client.queues.set(msg.guild.id, queue)

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(`A **${posicaoSong}°** Música [${songMovida.title}](${songMovida.url}) , foi movida para **${verifyPosition}** posição da queue.`)
                .setAuthor({ name: `| ✔️ Movida`, iconURL: msg.author.displayAvatarURL() })
            msg.channel.send({ embeds: [helpMsg] })

        } catch (e) { console.log(e), stopMusic(client, msg, cor), msg.channel.send(`\`${e}\``) };

    }
}