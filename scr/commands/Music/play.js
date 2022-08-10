const { MessageEmbed } = require('discord.js');
const Command = require('../../classes/command')
const Queue = require('../../classes/queue')

class CommandPlay extends Command {
    constructor() {
        super({
            name: "play",
            help: "Reproduz a música desejada no canal atual do usuário",
            type: 'music',
            usage: '<Comando> + <Pesquisa>',
            aliase: ["p"],
        })
    }

    async execute(client, msg, args) {

        const { cor } = client

        try {
            let queue = client.queues.get(msg.guild.id)
            const searchUser = args.join(" ");

            if (!searchUser || !msg.member.voice.channel) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription('Você precisa digitar algo para por músicas ou entrar em um canal de voz primeiro.')
                    .setAuthor({ name: `| ❌ Erro`, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            if (!queue) {
                queue = new Queue(client, msg)
                queue.setQueue()
            }

            const data = await Queue.songSearch(searchUser)
            const typesData = {
                'track': () => {
                    queue.addAndPlaySong(data)
                },
                'playlist': async () => {
                    const error = '??'
                    const { playlist, owner, songs, totalSongs, durationPlaylist, images } = data
                    const helpMsg100 = new MessageEmbed()
                        .setColor(cor)
                        .setDescription(`🅿️ **Playlist: [${playlist.name || error}](${playlist.url})\n🆔 Autor: [${owner.name || error}](${owner.url})\n📑 Total: ${totalSongs || error}\n🕑 Duração: ${durationPlaylist || error}**`)
                        .setAuthor({ name: '| 🎶 Playlist adicionada', iconURL: msg.author.displayAvatarURL() })
                    if (images) helpMsg100.setThumbnail(images)
                    await queue.tocarPlaylist(songs)
                    return msg.channel.send({ embeds: [helpMsg100] })
                }
            }

            return typesData[data.type]()

        } catch (e) {
            console.log(e)
            const helpMsg20 = new MessageEmbed()
                .setColor(cor)
                .setDescription('Não achei oque você procura')
                .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
            return msg.channel.send({ embeds: [helpMsg20] }).catch(() => { })
        }
    }
}

module.exports = CommandPlay
