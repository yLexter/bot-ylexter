const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "promisse",
    help: "Coloca uma música em 1° da Queue , A música pode ser do Spotify/Youtube e da Propía Queue Usando a Posição da Música na Queue.",
    type: 'music',
    aliase: ["prs", "pms"],
    execute: async (client, msg, args, cor) => {

        const { vdSearch, spotifySearch } = client.music

        try {

            let queue = client.queues.get(msg.guild.id);
            const s = args.join(" ")
            const incluso = (x) => { return s.toLowerCase().includes(x) }
            const spt = incluso("spotify.com/track")
            const ytb = isNaN(s) && queue.songs.length > 1

            if (!queue || incluso("list") && incluso('.com')) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .addFields(
                        { name: 'Sem músicas:', value: '**Não** existe musicas sendo tocada.' },
                        { name: 'Músicas:', value: 'Quantidade de músicas **insuficiente** para usar o promisse | menor 3.' },
                        { name: "Playlists:", value: "O promissse não aceita playlists de **Spotify** e **Youtube**." })
                    .setAuthor({ name: `| ❌ Prováveis Erros: `, iconURL: msg.author.displayAvatarURL()})
                return msg.channel.send({ embeds: [helpMsg] })
            }

            spt ? await searchSP(s) : ytb ? await pesq_yt(s) : await queue_msc(s)

            async function firstMusic(x) {
                let queue = client.queues.get(msg.guild.id);
                const first = queue.songs[0]
                queue.songs.shift()
                queue.songs.unshift(x)
                queue.songs.unshift(first)
                return client.queues.set(msg.member.guild.id, queue);
            }

            async function pesq_yt(x) {
                const track = await vdSearch(client, msg, x)
                embed(track)
                return firstMusic(track)
            }

            async function searchSP(x) {
                const track = await spotifySearch(client, msg, x)
                embed(track)
                return firstMusic(track)
            }

            async function queue_msc(x) {
                let queue = client.queues.get(msg.guild.id);
                let limite = queue.songs.length - 1
                let music = queue.songs[Number(x)]

                if (!music || x <= 1 || queue.songs.length <= 1) {
                    const helpMsg = new MessageEmbed()
                        .setColor(cor)
                        .addFields(
                            { name: "Músicas insuficiente ou número", value: '`Número de músicas insuficentes | Menor que 1`' },
                            { name: 'Numero invalido', value: '`Parâmetro não é um numero inteiro maior que 1`' })
                        .setAuthor({ name: `| Possiveis Erros: `, iconURL: msg.author.displayAvatarURL() })
                    if (x > limite) helpMsg.addFields({ name: "Número Incorreto", value: ` Você só pode colocar números > **1** e =< **${limite}**.` });
                    return msg.channel.send({ embeds: [helpMsg] })
                } else {
                    embed(queue.songs[x])
                    await firstMusic(queue.songs[x])
                    const numero = Number(x) + 1
                    queue.songs.splice(numero, 1)
                    return client.queues.set(msg.guild.id, queue)
                }
            }

            function embed(song) {
                let url = song.url
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(`[${song.title}](${url}) [${song.durationFormatted}]`)
                    .setAuthor({ name: `| Promissed`, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

        } catch (e) { return msg.reply({content: '`❌ Ocorreu um erro ao usar o promisse , tente novamente.`'}) };

    } // execute end
}











