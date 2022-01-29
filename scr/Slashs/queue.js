
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const wait = require('util').promisify(setTimeout);

const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Mostra as música da queue.')

module.exports = {
    name: 'queue',
    data: data,
    music: true,
    permissions: ["USE_APPLICATION_COMMANDS"],
    execute: async (client, interaction, cor) => {
        try {
            const { secondsToText } = client.music
            const queue = client.queues.get(interaction.guild.id);

            if (!queue || queue.songs.length == 0) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ❌ Erro `, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription('Não existe músicas sendo tocada.')
                return interaction.reply({ embeds: [helpMsg], ephemeral: true })
            }

            const { songs } = queue
            let quantidadePerPag = 10
            let pagsTotal = total_pags()
            const finishCommmand = 300
            let contador = 1

            function somarDuration() {
                const queue = client.queues.get(interaction.guild.id);
                let string = 0
                for (msc of queue.songs) {
                    string += msc.duration
                };
                return string / 1000
            }

            function queuePags(number) {
                const queue = client.queues.get(interaction.guild.id);
                const { songs } = queue
                let string = ''
                let pagAtual = number == 1 ? 1 : number * quantidadePerPag - quantidadePerPag + 1
                string = `🔊 **Tocando agora**\n[${songs[0].title}](${songs[0].url}) [${songs[0].durationFormatted}]\n\n`
                for (i = pagAtual; i < pagAtual + quantidadePerPag; i++) {
                    if (!songs[i]) break;
                    string += `**${i}**. [${songs[i].title}](${songs[i].url}) [${songs[i].durationFormatted}]\n`
                }
                return string
            }

            function total_pags() {
                const queue = client.queues.get(interaction.guild.id);
                const { songs } = queue
                const total = songs.length - 1
                return total < quantidadePerPag ? 1 : Math.ceil((total / quantidadePerPag))
            }

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('unnext')
                        .setStyle('PRIMARY')
                        .setEmoji('⏪')
                ).addComponents(
                    new MessageButton()
                        .setCustomId('reload')
                        .setStyle('PRIMARY')
                        .setEmoji('🔁')
                ).addComponents(
                    new MessageButton()
                        .setCustomId('next')
                        .setStyle('PRIMARY')
                        .setEmoji('⏩'),
                )

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setDescription(queuePags(1))
                .setAuthor({ name: `| 📑 Queue`, iconURL: interaction.user.displayAvatarURL() })
                .addFields({ name: "Info's", value: `\nTotal: ${songs.length - 1} | Pag's: 1/${pagsTotal} | Tempo: ${secondsToText(somarDuration())}` })
            await interaction.reply({ embeds: [helpMsg], ephemeral: true, fecthReply: true, components: [row] })

            const filter = (i) => { return interaction.user.id == i.user.id }

            const collector = await interaction.channel.createMessageComponentCollector({ filter, time: finishCommmand * 1000 });

            collector.on('collect', async i => {
                try {
                    const queue = client.queues.get(interaction.guild.id);

                    if (!queue || queue.songs.length == 0) {
                        await i.deferUpdate();
                        return collector.stop()
                    }

                    const { songs } = queue
                    const pagsTotal = total_pags()

                    function mudarMsg(number) {
                        const helpMsg = new MessageEmbed()
                            .setColor(cor)
                            .setDescription(queuePags(number))
                            .setAuthor({ name: `| 📑 Queue`, iconURL: interaction.user.displayAvatarURL() })
                            .addFields({ name: "Info's", value: `\nTotal: ${songs.length - 1} | Pag's: ${contador}/${pagsTotal} | Tempo: ${secondsToText(somarDuration())}` })
                        return interaction.editReply({ embeds: [helpMsg], ephemeral: true, fecthReply: true, components: [row] }).catch(() => { })
                    }

                    function firstPag() {
                        contador = 1
                        return mudarMsg(1)
                    }

                    if (contador > pagsTotal) {
                        await i.deferUpdate()
                        return firstPag()
                    }

                    const buttons = {
                        'reload': () => {
                            firstPag()
                        },
                        'next': () => {
                            if (pagsTotal == 1) return;
                            if (contador == pagsTotal) return firstPag();
                            // if (contador == pagsTotal) return;
                            contador++
                            return mudarMsg(contador)
                        },
                        'unnext': () => {
                            if (pagsTotal == 1) return;
                            if (contador == 1) {
                                contador = pagsTotal
                                return mudarMsg(pagsTotal);
                            }
                            //if (contador == 1) return;
                            contador--
                            return mudarMsg(contador)
                        }
                    }

                    await i.deferUpdate()
                    await wait(0.5 * 1000)
                    await buttons[i.customId]()

                } catch (e) { return }
            })


            collector.on('end', async collected => {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| Comando Cancelado por não existir música tocando ou tempo de uso atingido.`, iconURL: interaction.user.displayAvatarURL() })
                return await interaction.editReply({ embeds: [helpMsg], ephemeral: true, fecthReply: true, components: [] }).catch(e => console.log(e))
            })

        } catch (e) { return }


    }
}











