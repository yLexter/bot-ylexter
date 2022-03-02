const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const games = new Map();

module.exports = {
    name: "jokenpo",
    help: "Jogo tradicional de pedra, papel e tesoura.",
    type: "fun",
    aliase: ["jkp"],
    execute: async (client, msg, args, cor) => {
        try {
            const adversario = msg.mentions.members.first() || msg.guild.members.cache.get(args[0])
            const timerCollector = 60
            const timeUserAccept = 15
            const emojiPedra = '🥌'
            const emojiTesoura = '✂️'
            const emojiPapel = '📃'
            const buscarPlayer = (idPlayer) => { return [...games?.values()].find(x => x.players.find(y => y == idPlayer)) }

            if (!adversario) return msg.reply(' ❌| **Ops! , Você precisa mencionar algúem para jogar.**');
            if (msg.author.id == adversario.user.id) return msg.reply('🚫| Você não pode jogar contra si mesmo, é muito fácil.')
            if (adversario.user.id == client.user.id) return msg.reply('❌| Nem tenta , eu ganho fácil fácil...')
            if (adversario.user.bot) return msg.reply('❌| Você não pode jogar contra bots , eles só são inteligente no xadrez.');
            if (buscarPlayer(msg.author.id) || buscarPlayer(adversario.user.id)) return msg.reply('❌| Ops! Você ou seu adversário já estão em uma partida.');

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('accept')
                        .setLabel('Aceitar')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('decline')
                        .setLabel('Recusar')
                        .setStyle('DANGER')
                );

            const msgChallenger = await msg.channel.send({ content: `**🔰| <@${adversario.user.id}>, O <@${msg.author.id}> está te chamando para jogar jokenpo.**`, components: [row] })
            newGame(msg.author.id, adversario.user.id)

            const filter = i => { return i.user.id == adversario.user.id }
            const collector = msg.channel.createMessageComponentCollector({ filter, time: timeUserAccept * 1000, max: 1 })

            collector.on('collect', async i => {
                try {
                    const buttons = {
                        'accept': async () => {
                        },
                        'decline': async () => {
                            games.delete(msg.author.id)
                        }
                    }

                    i.deferUpdate();
                    return buttons[i.customId]()

                } catch (e) { games.delete(msg.author.id), collector.stop() }
            });

            collector.on('end', async collected => {
                try {
                    const game = games.get(msg.author.id)

                    if (collected.size == 0 || !game) {
                        games.delete(msg.author.id)
                        return msgChallenger.edit({ content: `**❌| O adversário <@${adversario.user.id}> não aceitou o desafio.**`, embeds: [], components: [] }).catch(() => { games.delete(msg.author.id) })
                    }

                    const buttons = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('pedra')
                                .setLabel('Pedra')
                                .setStyle('PRIMARY')
                                .setEmoji(emojiPedra),
                            new MessageButton()
                                .setCustomId('papel')
                                .setLabel('Papel')
                                .setStyle('PRIMARY')
                                .setEmoji(emojiPapel),
                            new MessageButton()
                                .setCustomId('tesoura')
                                .setStyle('PRIMARY')
                                .setLabel('Tesoura')
                                .setEmoji(emojiTesoura),
                        );

                    const embed = new MessageEmbed()
                        .setAuthor({ name: `| ${msg.author.username} x ${adversario.user.username}`, iconURL: msg.author.displayAvatarURL() })
                        .setDescription('Escolha um dos botões para jogar , após isso aguarde seu oponente.')
                        .setImage('https://publicdomainvectors.org/photos/rock-paper-scissors.png')
                        .setFooter({ text: 'Caso um dos jogadores não escolham , o jogo será cancelado' })

                    msgChallenger.edit({ content: `<@${adversario.user.id}>, O <@${msg.author.id}> lhe chamou para um jokenpo.`, embeds: [embed], components: [buttons] }).catch(() => { games.delete(msg.author.id) })
                } catch (e) { games.delete(msg.author.id) }

                const filter = i => { return msg.author.id == i.user.id || adversario.user.id == i.user.id }
                const collector = msg.channel.createMessageComponentCollector({ filter, time: timerCollector * 1000 })

                collector.on('collect', async i => {
                    try {
                        let game = games.get(msg.author.id)
                        const verifyPlayer = i.user.id == game.player1.id ? 'player1' : 'player2'
                        const player = game[verifyPlayer]

                        if (player.jogada) return i.deferUpdate();

                        const jogadas = {
                            'pedra': async () => {
                                insertJogada(i.user.id, 'pedra')
                            },
                            'tesoura': async () => {
                                insertJogada(i.user.id, 'tesoura')
                            },
                            'papel': async () => {
                                insertJogada(i.user.id, 'papel')
                            }
                        }

                        jogadas[i.customId]()
                        game = games.get(msg.author.id)

                        if (game.player1.jogada && game.player2.jogada) {
                            i.deferUpdate();
                            return collector.stop();
                        }

                        msgChallenger.edit({ content: `<@${i.user.id}> escolheu sua jogada!` }).catch(() => { games.delete(msg.author.id) })
                        i.deferUpdate();

                    } catch (e) { games.delete(msg.author.id), collector.stop() }
                })

                collector.on('end', collected => {
                    try {
                        if (collected.size == 0) {
                            games.delete(msg.author.id)
                            return msgChallenger.edit({ content: 'Nenhum dos players escolheram uma jogada!', components: [], embeds: [] }).catch(() => { games.delete(msg.author.id) })
                        }

                        game()

                    } catch (e) { games.delete(msg.author.id) }
                })

            });

            function game() {
                try {
                    const game = games.get(msg.author.id)
                    const notPlayed = !game.player1.jogada ? game.player1 : !game.player2.jogada ? game.player2 : null

                    if (notPlayed) {
                        games.delete(msg.author.id)
                        return msgChallenger.edit({ content: `O Player <@${notPlayed.id}> não escolheu nenhuma jogada, o jogo foi cancelado.`, components: [], embeds: [] }).catch(() => { games.delete(msg.author.id) })
                    }

                    const { player1, player2 } = game
                    const emojisRespectMove = {
                        'tesoura': emojiTesoura,
                        'papel': emojiPapel,
                        'pedra': emojiPedra
                    }
                    const playerAndEmoji = (jogador) => { return `${emojisRespectMove[jogador.jogada]} <@${jogador.id}>` }

                    let winner = veryfiWinner()

                    if (!winner) {
                        games.delete(msg.author.id)
                        return msgChallenger.edit({ content: `**🏆| Empaate!\nNinguém venceu! Ambos escolheram ${emojisRespectMove[player1.jogada]} ${player1.jogada}.**`, components: [], embeds: [] }).catch(() => { games.delete(msg.author.id) })
                    }

                    games.delete(msg.author.id)
                    return msgChallenger.edit({ content: `**🏆| O <@${winner.id}> venceu!!\nAs jogadas foram ${playerAndEmoji(player1)} e ${playerAndEmoji(player2)}.**`, components: [], embeds: [] }).catch(() => { games.delete(msg.author.id) })

                } catch (e) {
                    games.delete(msg.author.id)
                }
            }

            function veryfiWinner() {
                const game = games.get(msg.author.id)
                if (game.player1.jogada == game.player2.jogada) return false

                const wins = {
                    'pedra': 'tesoura',
                    'papel': 'pedra',
                    'tesoura': 'papel'
                }

                return wins[game.player1.jogada] == game.player2.jogada ? game.player1 : game.player2

            }

            function newGame(challenger, challenged) {
                const game = {
                    players: [challenger, challenged],
                    player1: {
                        id: challenger,
                        jogada: null
                    },
                    player2: {
                        id: challenged,
                        jogada: null
                    }
                }
                games.set(msg.author.id, game)
            }

            function insertJogada(player, jogada) {
                let game = games.get(msg.author.id)
                let verifyPlayer = player == game.player1.id ? 'player1' : 'player2'
                game[verifyPlayer].jogada = jogada
                games.set(msg.author.id, game)
            }


        } catch (e) { return games.delete(msg.author.id), msg.channel.send(`\`${e}\``) }
    }
};