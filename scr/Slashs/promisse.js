const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const wait = require('util').promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('promisse')
    .setDescription('Põem uma música da queue ou pesquisa em 1° lugar da queue.')
    .addStringOption(option => option.setName('music').setDescription('Insira um número referente a música da queue , ou uma pesquisa/urls').setRequired(true))

module.exports = {
    name: 'promisse',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    music: true,
    execute: async (client, interaction, cor) => {

        const { vdSearch, spotifySearch } = client.music
        const s = interaction.options.getString('music')
        const queue = client.queues.get(interaction.guild.id);

        const incluso = (x) => { return s.toLowerCase().includes(x) }
        const spt = incluso("spotify.com/track")
        const ytb = isNaN(s) && queue.songs.length >= 2

        if (!queue || incluso("list") && incluso('.com')) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .addFields(
                    { name: 'Sem músicas', value: '**Não** existe musicas sendo tocada.' },
                    { name: "Playlists", value: "O promissse não aceita playlists de **Spotify** e **Youtube**." })
                .setAuthor({ name: `| ❌ Prováveis Erros: `, iconURL: interaction.user.displayAvatarURL() })
            return interaction.reply({ embeds: [helpMsg], ephemeral: true }).catch(() => { })
        }

        try {
            await interaction.deferReply();
            const song = spt ? await searchSP(s) : ytb ? await pesq_yt(s) : await queue_msc(s)
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(`[${song.title}](${song.url}) [${song.durationFormatted}]`)
                .setAuthor({ name: `| Promissed`, iconURL: interaction.user.displayAvatarURL() })
            return interaction.editReply({ embeds: [helpMsg], ephemeral: false }).catch(() => { })
        } catch (e) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .addFields(
                    { name: "Músicas insuficiente ou número", value: '`Número de músicas insuficentes | Menor que 1`' },
                    { name: 'Numero Inválido', value: '`Parâmetro não é um número inteiro maior que 1.`' },
                    { name: 'Link Inválido', value: '`A música não foi econtrada.`' })
                .setAuthor({ name: `| ❌ Ocorreu um erro ao usar o promisse.`, iconURL: interaction.user.displayAvatarURL() })
            return interaction.editReply({ embeds: [helpMsg], ephemeral: false }).catch(() => { })
        }

        async function firstMusic(x) {
            let queue = client.queues.get(interaction.guild.id);
            const first = queue.songs[0]
            queue.songs.shift()
            queue.songs.unshift(x)
            queue.songs.unshift(first)
            return client.queues.set(interaction.guild.id, queue);
        }

        async function pesq_yt(x) {
            const song = await vdSearch(client, interaction, x)
            firstMusic(song)
            return song
        }

        async function searchSP(x) {
            const song = await spotifySearch(client, interaction, x)
            firstMusic(song)
            return song
        }

        async function queue_msc(x) {
            const number = Math.floor(Number(x))
            let queue = client.queues.get(interaction.guild.id);
            let music = queue.songs[number]

            if (!music || queue.songs.length <= 2 || x == 1) {
                throw new Error('Error not found.')
            } else {
                const music = queue.songs[x]
                await firstMusic(music)
                const numero = Number(x) + 1
                queue.songs.splice(numero, 1)
                client.queues.set(interaction.guild.id, queue)
                return music
            }
        }
    }
}


