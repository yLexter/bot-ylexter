const { MessageEmbed } = require("discord.js");
const channels = new Map();
const words = require('../../Jsons/caçapalavras.json').palavras

module.exports = {
    name: "forca",
    help: "Jogo tradicional da forca",
    type: "fun",
    aliase: [],
    execute: async (client, msg, args, cor) => {

        try {
            const maximumAttempts = 7
            const alfabeto = 'abcdefghijklmnopqrstuvwxyzç'
            const word = words[Math.floor(Math.random() * words.length)].toLowerCase()
            const wordArray = word.split("")
            const game = channels.get(msg.channel.id)
            const InvativyCollector = 30
            const string = `**📝 Esta palavra contém ${word.length} letras.**`
            let contador = 0

            if (game) return msg.reply({ content: '**❌| Já existe uma forca neste canal.**' });

            const gamer = newGame(msg.channel.id)
            const msgPrincipal = await msg.channel.send({ content: string, embeds: [embedGame(gamer.wordHidden.join(""), 'Nenhuma')] })
            const collector = msg.channel.createMessageCollector({
                filter: m => { return alfabeto.split("").some(x => { return x == m.content.toLowerCase() }) || m.content.toLowerCase() == word.toLowerCase() },
                idle: InvativyCollector * 1000,
                time: 120 * 1000
            })

            collector.on('collect', m => {
                const game = channels.get(msg.channel.id)
                const response = m.content.toLowerCase()

                if (game.allWords.includes(response)) return;

                wordArray.forEach((element, indice) => {
                    if (element == response) {
                        game.wordHidden.splice(indice, 1, response)
                        game.rigthWords.push(element)
                    }
                })

                const wordUpdated = game.wordHidden.join("")

                if (response == word) {
                    winnerGame(m.author.id)
                    return collector.stop();
                }

                game.allWords.push(response)
                channels.set(msg.channel.id, game)

                if (!word.includes(response)) {
                    contador++
                    if (contador == maximumAttempts) return collector.stop();
                    editMessageEmbed(embedGame(wordUpdated, game.allWords.join(", ")))
                    return collector.resetTimer()
                }

                if (game.rigthWords.length == word.length) {
                    winnerGame(m.author.id)
                    return collector.stop()
                }

                editMessageEmbed(embedGame(wordUpdated, game.allWords.join(", ")))
                channels.set(msg.channel.id, game)
                return collector.resetTimer()
            })

            collector.on('end', collected => {
                const game = channels.get(msg.channel.id)
                const stringWinner = game?.winner ? `**🏆 Parabéns ao <@${game.winner}> por acertar a palavra!**` : '**❌ Ninguém acertou a palavra.**'
                editMessageEmbed(embedGame(word, game.allWords.join(", ")), stringWinner)
                return channels.delete(msg.channel.id)
            })

            function newGame(channel) {
                const game = {
                    winner: null,
                    channelId: channel,
                    rigthWords: [],
                    allWords: [],
                    wordHidden: wordArray.map(x => { return "_" })
                }
                channels.set(channel, game)
                return channels.get(channel)
            }

            function winnerGame(winner) {
                let game = channels.get(msg.channel.id)
                game.winner = winner
                channels.set(msg.channel.id, game)
            }

            function embedGame(word, rigthWords) {
                return new MessageEmbed()
                    .setAuthor({ name: '| Forca Tradicional', iconURL: client.user.displayAvatarURL() })
                    .setTitle(`Forca ${contador}/${maximumAttempts}`)
                    .setColor(cor)
                    .setDescription(`\`\`\`txt\n${word}\n\`\`\`\n`)
                    .setFooter({ text: `Letras Usadas: ${rigthWords}` })
            }

            function editMessageEmbed(embed, content = string) {
                return msgPrincipal.edit({ content: content, embeds: [embed] }).catch(() => { channels.delete(msg.channel.id) })
            }

        } catch (e) { msg.channel.send(`\`${e}\``), channels.delete(msg.channel.id) };

    } // Execute end;
}
