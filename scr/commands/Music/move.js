const { MessageEmbed } = require("discord.js");
const Command = require('../../classes/command')

class CommandMove extends Command {
    constructor() {
        super({
            name: "move",
            help: "Move uma música para determinada posição da fila.",
            type: 'music',
            usage: '<Comando> + <Posição da Música que deseja mover> + <Nova Posiçãp> || Ex: move 10 5, muda a 10° música para 5° posição.',
            aliase: [],
        })
    }

    async execute(client, msg, args) {

        const { cor } = client
        const { stop, move } = client.music

        try {
            const queue = client.queues.get(msg.guild.id);
            const posicaoSong = Math.abs(Math.floor(Number(args[0])))
            const newPosicaoSong = Math.abs(Math.floor(Number(args[1])))

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

            const verifyPosition = newPosicaoSong > queue.songs.length ? `última [${queue.songs.length}°]` : `${newPosicaoSong}°`

            move(client, msg, posicaoSong, newPosicaoSong)

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(`A **${posicaoSong}°** Música [${songMovida.title}](${songMovida.url}) , foi movida para **${verifyPosition}** posição da queue.`)
                .setAuthor({ name: `| ✔️ Movida`, iconURL: msg.author.displayAvatarURL() })
            msg.channel.send({ embeds: [helpMsg] })

        } catch (e) { console.log(e), stop(client, msg), msg.channel.send(`\`${e}\``) };

    }
}

module.exports =  CommandMove