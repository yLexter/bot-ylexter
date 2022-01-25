
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const YouTube = require("youtube-sr").default;
const wait = require('util').promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('search-youtube')
    .setDescription('Faz uma procura no youtube e coloca a música na queue.')
    .addStringOption(option => option.setName('musica').setDescription('Digite o nome da música que procura.').setRequired(true))

module.exports = {
    name: 'search-youtube',
    data: data,
    permissions: ["USE_APPLICATION_COMMANDS"],
    music: true,
    execute: async (client, interaction, cor) => {

        await interaction.deferReply();
        const { playSong } = client.music
        const s = interaction.options.getString('musica')
        const queueSyt = client.queues.get(`${interaction.guild.id}.YTB`)
        const listResult = await YouTube.search(s, { limit: 11, safeSearch: true });
        const listaFiltrado = listResult.filter(m => { return m.duration > 0 })
        const maxTempo = 30
        let string = '';

        if (queueSyt || (listaFiltrado && listaFiltrado.length == 0)) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ❌ Erro: `, iconURL: interaction.user.displayAvatarURL() })
                .setDescription('Pesquisa invalida ou Busca em andamento')
            return interaction.editReply({ embeds: [helpMsg], ephemeral: false })
        }

        client.queues.set(`${interaction.guild.id}.YTB`, true)
        listaFiltrado.forEach((element, indice) => {
            string += `${indice}. [${element.title}](${element.url}) [${element.durationFormatted}]\n`
        });

        const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setDescription(string)
            .setAuthor({ name: `|🔎 Pesquisa do Youtube`, iconURL: interaction.user.displayAvatarURL() })
            .addField("Info:", `Digite um número de **0 a ${listaFiltrado.length - 1}** dentre **${maxTempo}s** para por a música , caso contrário a busca será **cancelada** | Use **!cancel para cancelar.**`)
        await interaction.editReply({ embeds: [helpMsg], ephemeral: false })

        const filter = m => {
            return ((m.content >= 0 && m.content <= listaFiltrado.length - 1) || m.content == "!cancel")
                && interaction.member.voice.channel
                && interaction.user.id === m.author.id
                && interaction.channel.id === m.channel.id
        }

        const collector = interaction.channel.createMessageCollector({
            filter,
            time: maxTempo * 1000,
            max: 1
        })

        collector.on('collect', async m => {

            await wait(0.5 * 1000)
            m.delete().catch(() => { })

            if (m.content.toLowerCase() == "!cancel") {
                return collector.stop()
            }
            const song = listaFiltrado[m]
            let queue = client.queues.get(interaction.guild.id);
            if (queue) {
                queue.songs.push(song);
                client.queues.set(interaction.guild.id, queue);
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setTitle(song.title)
                    .setAuthor({ name: `| 🎶 Adicionado a Queue`, iconURL: interaction.user.displayAvatarURL() })
                    .setURL(song.url)
                    .setDescription(`Duração: **${song.durationFormatted}**`)
                interaction.channel.send({ embeds: [helpMsg], ephemeral: false })
                collector.stop();
            } else {
                collector.stop();
                playSong(client, interaction, song)
            }
        });

        collector.on('end', async collected => {
            try {
                await interaction.deleteReply()
                client.queues.delete(`${interaction.guild.id}.YTB`)
            } catch (e) { return }
        });
    }
}












