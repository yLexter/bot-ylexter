const { MessageEmbed } = require("discord.js");
const Command = require('../../classes/command')

class CommandPromisse extends Command {
    constructor() {
        super({
            name: "promisse",
            help: "Coloca uma música em 1° lugar da Queue.",
            type: 'music',
            usage: '<Comando> + <Pesquisa ou Posição da Queue> || Ex: <promisse 10> ou <promisse industry baby>',
            aliase: ["prs", "pms"],
        })
    }

    async execute(client, msg, args) {

        const { cor } = client
        
        const { songSearch , move } = client.music

        try {
            const incluso = (x) => { return s.toLowerCase().includes(x) }
            const queue = client.queues.get(msg.guild.id);
            const s = args.join(" ")
            const searchPromisse = isNaN(s)

            if (!queue || incluso("list") && incluso('.com') || queue.songs.length <= 1) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .addFields(
                        { name: 'Songs', value: 'O Promisse só funciona com mais de 1 música na queue.' },
                        { name: 'Sem músicas:', value: '**Não** existe musicas sendo tocada.' },
                        { name: 'Músicas:', value: 'Quantidade de músicas **insuficiente** para usar o promisse | menor 3.' },
                        { name: "Playlists:", value: "O promissse não aceita playlists de **Spotify** e **Youtube**." })
                    .setAuthor({ name: `| ❌ Prováveis Erros: `, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            searchPromisse ? await promisseSearch(s) : await queuePromisse(s)

            async function promisseSearch(search) {
                const song = await songSearch(client, msg, search)
                if (song.type !== 'track') return msg.reply({ content: '❌| O promisse aceita apenas tracks.' })
                await firstMusic(song)
                return embed(song)
            }

            async function firstMusic(x) {
                let queue = client.queues.get(msg.guild.id);
                const first = queue.songs[0]
                queue.songs.shift()
                queue.songs.unshift(x)
                queue.songs.unshift(first)
                return client.queues.set(msg.guild.id, queue);
            }

            async function queuePromisse(number) {
                let limite = queue?.songs.length - 1
                let music = queue?.songs[number]

                if (!music || number <= 1) {
                    const helpMsg = new MessageEmbed()
                        .setColor(cor)
                        .addFields({ name: 'Numero invalido', value: '`Parâmetro não é um numero inteiro maior que 1`' })
                        .setAuthor({ name: `| Possiveis Erros: `, iconURL: msg.author.displayAvatarURL() })
                    if (number > limite) helpMsg.addFields({ name: "Número Incorreto", value: ` Você só pode colocar números maiores que **1** e menores ou igual a **${limite}**.` });
                    return msg.channel.send({ embeds: [helpMsg] })
                }
                
                move(client, msg, number, 1)
                return embed(music)
            }

            function embed(song) {
                let url = song.url
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`[${song.title}](${url}) [${song.durationFormatted}]`)
                    .setAuthor({ name: `| Promissed`, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

        } catch (e) { return msg.reply({ content: '`❌ Ocorreu um erro ao usar o promisse , tente novamente.`' }) };
        
    }
}

module.exports = CommandPromisse











