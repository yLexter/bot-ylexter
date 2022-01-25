const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Toca uma música/playlist no servidor')
    .addStringOption(option => option.setName('search').setDescription('Insira uma busca , ou urls de videos e playlists.').setRequired(true))

module.exports = {
    name: 'play',
    data: data,
    music: true,
    permissions: ["USE_APPLICATION_COMMANDS"],
    execute: async (client, interaction, cor) => {

        const s = interaction.options.getString('search')
        const { tocarPlaylist, secondsToText, spotifySearch, vdSearch, ytPlaylist, playSong } = client.music

        const spt = s.toLowerCase().includes('spotify.com')
        var resultado = s.toLowerCase().includes('list=');

        if (!interaction.member.voice.channel) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription('Você precisa estar em um canal de voz para usar esse comando.')
                .setAuthor({ name: `| ❌ Erro: `, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: true })
        }

        try {
            await interaction.deferReply();
            spt ? await tocarSpotify(s) : resultado ? await tocarPlaylistYt(s) : await tocarVideoYt(s)
        } catch (e) {
            console.log(e)
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Erro`, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`Ocorreu um Erro Ao Buscar sua Música/Playlist , Tente Novamente.`)
            return interaction.editReply({ embeds: [helpMsg], ephemeral: false }).catch(() => { })
        }

        async function tocarVideoYt(item) {
            const queue = client.queues.get(interaction.guild.id);
            const song = await vdSearch(client, interaction, item)

            if (queue) {
                queue.songs.push(song);
                client.queues.set(interaction.guild.id, queue);
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setTitle(`${song.title}`)
                    .setAuthor({ name: `| 🎶 Adicionado a Fila - #${queue.songs.length - 1}`, iconURL: interaction.user.displayAvatarURL() })
                    .setURL(song.url)
                    .setDescription(`Duração: **${song.durationFormatted}**`)
                return interaction.editReply({ embeds: [helpMsg], ephemeral: false }).catch(() => { })
            } else {
                playSong(client, interaction, song)
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setTitle(`${song.title}`)
                    .setAuthor({ name: `| 🎶 Adicionado a Queue`, iconURL: interaction.user.displayAvatarURL() })
                    .setURL(song.url)
                    .setDescription(`Duração: **${song.durationFormatted}**`)
                return interaction.editReply({ embeds: [helpMsg], ephemeral: false }).catch(() => { })
            }
        }

        async function tocarPlaylistYt(item) {
            const queue = client.queues.get(interaction.guild.id);
            const lista2 = await ytPlaylist(client, interaction, item)
            const { title, videoCount, views, channel, url, songs, total } = lista2

            await tocarPlaylist(client, interaction, songs)

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(`🅿️ **Playlist: [${title}](${url})**\n🆔 **Autor: [${channel.name}](${channel.url})**\n📑 **Total: ${videoCount}**\n**❤️ Views: ${views}\n**🕑 **Duração: ${secondsToText(total / 1000)}**`)
                .setAuthor({ name: '| 🎶 Playlist adicionada', iconURL: interaction.user.displayAvatarURL() })
            return interaction.editReply({ embeds: [helpMsg], ephemeral: false }).catch(() => { })
        };

        async function tocarSpotify(item) {

            const spotify = await spotifySearch(client, interaction, item)

            const spotifyObejcts = {
                'playlist': async () => {
                    const { owner, likes, total, images, playlist, songs, duration } = spotify
                    const helpMsg = new MessageEmbed()
                        .setColor(cor)
                        .setDescription(`🅿️ **Playlist: [${playlist.name}](${playlist.url})**\n🆔 **Autor: [${owner.name}](${owner.url})**\n📑 **Total: ${total}**\n**❤️ Likes: ${likes}\n**🕑 **Duração: ${duration}**`)
                        .setAuthor({ name: '| 🎶 Playlist adicionada', iconURL: interaction.user.displayAvatarURL() })
                    if (images[0].url) helpMsg.setThumbnail(images[0].url)
                    await tocarPlaylist(client, interaction, songs)
                    return interaction.editReply({ embeds: [helpMsg], ephemeral: false }).catch(() => { })
                },

                'track': async () => {
                    const track = [spotify]
                    const helpMsg = new MessageEmbed()
                        .setColor(cor)
                        .setTitle(track[0].title)
                        .setURL(track[0].url)
                        .setAuthor({ name: '| 🎶 Track Adicionada', iconURL: interaction.user.displayAvatarURL() })
                    await tocarPlaylist(client, interaction, track)
                    return interaction.editReply({ embeds: [helpMsg], ephemeral: false }).catch(() => { })
                }
            }

            await spotifyObejcts[spotify.type]()

        }

    } // End execute
}



