const { MessageEmbed } = require('discord.js');
const Command = require('../../classes/command')

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
            const { songSearch, tocarPlaylist, PushAndPlaySong, } = client.music
            const s = args.join(" ");

            if (!s || !msg.member.voice.channel) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription('Você precisa digitar algo para por músicas ou entrar em um canal de voz primeiro.')
                    .setAuthor({ name: `| ❌ Erro`, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            const data = await songSearch(client, msg, s)
            const typesData = {
                'track': () => {
                    PushAndPlaySong(client, msg, cor, data)
                },
                'playlist': async () => {
                    const error = '??'
                    const { playlist, owner, songs, totalSongs, durationPlaylist, images } = data
                    const helpMsg100 = new MessageEmbed()
                        .setColor(cor)
                        .setDescription(`🅿️ **Playlist: [${playlist.name || error}](${playlist.url})\n🆔 Autor: [${owner.name || error}](${owner.url})\n📑 Total: ${totalSongs || error}\n🕑 Duração: ${durationPlaylist || error}**`)
                        .setAuthor({ name: '| 🎶 Playlist adicionada', iconURL: msg.author.displayAvatarURL() })
                    if (images) helpMsg100.setThumbnail(images)
                    await tocarPlaylist(client, msg, songs)
                    return msg.channel.send({ embeds: [helpMsg100] }).catch(e => { })
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
