const { MessageEmbed, MessageAttachment } = require("discord.js");
const { createCanvas, loadImage } = require('canvas')
const wait = require('util').promisify(setTimeout);
const games = new Map();

module.exports = {
    name: "jogodavelha",
    help: "Jogo da Velha Tradicional.",
    aliase: ['velha'],
    type: "fun",
    execute: async (client, msg, args, cor) => {

        try {
            const jogadasPossiveis = ['1a', '2a', '3a', '1b', '2b', '3b', '1c', '2c', '3c']
            const tempoGame = 300
            const ladoQuadrado = 300
            const larguraBarra = 10
            const tamanhoElement = 80
            const timeCollector = 60
            const adversario = msg.mentions.members.first()
            const { xImagem, oImagem } = await getXAndO()

            if (!adversario || msg.author.id == adversario.user.id || adversario.user.bot) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: '❌ Mencione alguem para jogar contra', iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            const buscarPlayer = idPlayer => { return [...games.values()].find(x => x.players.find(y => y == idPlayer)) }
            const verificaoPlayer = buscarPlayer(msg.author.id) || buscarPlayer(adversario.user.id)

            if (verificaoPlayer) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: '| Você ou seu Adversário já estão em Partida', iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ${msg.author.username} vs ${adversario.user.username} `, iconURL: msg.author.displayAvatarURL() })
                .setImage('https://i.imgur.com/JIAbZhp.png')
                .setFooter({ text: 'Caso o Adversário não reaga , a partida será cancelada!' })
            const msgPrincipal = await msg.channel.send({ content: `<@${adversario.user.id}>`, embeds: [helpMsg] })

            await msgPrincipal.react('✔️')

            const filter = (reaction, user) => { return reaction.emoji.name == '✔️' && user.id == adversario.user.id }
            const collector = msgPrincipal.createReactionCollector({ filter, time: timeCollector * 1000, max: 1 })

            collector.on('collect', (reaction, user) => { collector.stop() });

            collector.on('end', async collected => {
                try {
                    if (collected.size == 0) return msg.channel.send({ content: '❌ O Adversário não aceitou o Desafio.' });

                    let game = games.get(msg.author.id)

                    if (!game) {
                        msg.channel.send({ content: 'O Jogo vai começar.' })
                        velha = {
                            players: [msg.author.id, adversario.user.id],
                            vez: null,
                            jogadasFeitas: [],
                            jogadorX: null,
                            jogadorY: null,
                        }
                        velha.vez = velha.players[Math.floor(Math.random() * velha.players.length)]
                        velha.jogadorX = velha.players[0]
                        velha.jogadorY = velha.players[1]
                        games.set(msg.author.id, velha)
                    }

                    game = games.get(msg.author.id)

                    const { canvas } = gerarLayout()
                    const imagem = new MessageAttachment(canvas.toBuffer(), 'firstImagem.png')
                    const msgSecundaria = await msg.channel.send({ content: `🔰 Jogador X: <@${game.jogadorX}> | Jogador O: <@${game.jogadorY}> \n🔰 A vez de Jogar é de <@${game.vez}>`, files: [imagem] })

                    const filter = m => { return buscarPlayer(m.author.id) && jogadasPossiveis.find(x => { return x == m.content.toLowerCase() }) }

                    const collector = msg.channel.createMessageCollector({ filter, time: tempoGame * 1000 });

                    collector.on('collect', async m => {
                        try {
                            let game = games.get(msg.author.id)
                            let { jogadorX, jogadorY, jogadasFeitas } = game
                            const jogadaPlayer = m.content.toLowerCase()
                            const verifyJogada = jogadasFeitas.find(x => { return x.jogadaFeita == jogadaPlayer })
                            const player = game.vez

                            if (m.author.id != game.vez) return m.reply({ content: '⚠️ Não é sua vez de jogar!' })
                            if (verifyJogada) return m.reply({ content: '❌ Essa Jogada já foi feita , Escolha outra.' })

                            const jogadaFeita = jogadasPossiveis.find(x => { return x == jogadaPlayer })
                            jogadasFeitas.push({ jogador: game.vez, jogadaFeita })

                            player == jogadorX ? game.vez = jogadorY : game.vez = jogadorX
                            games.set(msg.author.id, game)

                            await wait(1 * 1000)
                            const { canvas, ctx } = gerarLayout()

                            for (let jogada of game.jogadasFeitas) {
                                let element = jogada.jogador == game.jogadorX ? xImagem : oImagem
                                const { xPosition, yPosition } = insertElement(jogada.jogadaFeita)
                                ctx.drawImage(element, xPosition, yPosition, tamanhoElement, tamanhoElement)
                            }

                            const winner = verifyWinner(player)

                            if (winner) {
                                collector.stop()
                                const file = new MessageAttachment(canvas.toBuffer(), 'imagemAtt.png')
                                const helpMsg = new MessageEmbed()
                                    .setColor(cor)
                                    .setAuthor({ name: '| 🏆 Campeão', iconURL: msg.author.displayAvatarURL() })
                                    .setDescription(`O <@${player}> Venceu o jogo da velha!`)
                                return msg.channel.send({ embeds: [helpMsg], files: [file] })
                            }

                            if (jogadasFeitas.length == jogadasPossiveis.length) {
                                collector.stop()
                                const file = new MessageAttachment(canvas.toBuffer(), 'imagemAtt.png')
                                const helpMsg = new MessageEmbed()
                                    .setColor(cor)
                                    .setAuthor({ name: '| 🏆 Empate', iconURL: msg.author.displayAvatarURL() })
                                    .setDescription(`Veeeelha! Nínguem ganhou a partida`)
                                return msg.channel.send({ embeds: [helpMsg], files: [file] })
                            }

                            const file = new MessageAttachment(canvas.toBuffer(), 'imagemAtt.png')
                            msgSecundaria.edit({ content: `🔰 Jogador X: <@${game.jogadorX}> | Jogador O: <@${game.jogadorY}> \n🔰 A vez de Jogar é de <@${game.vez}>`, files: [file] }).catch(e => console.log(e))

                        } catch (e) { console.log(e), collector.stop(), msg.channel.send({ content: 'Ops ocorreu um Erro Inesperado , o Jogo foi Cancelado , Caso pesista avise ao dono do Bot.' }) }
                    });

                    collector.on('end', collected => { games.delete(msg.author.id) });

                } catch (e) { games.delete(msg.author.id) }

            });

            function verifyWinner(player) {
                let game = games.get(msg.author.id)
                let jogadas = game.jogadasFeitas.filter(x => { return x.jogador == player })

                const filter = (jogada) => { return jogadas.find(x => { return x.jogadaFeita == jogada }) }

                if (jogadas.length < 3) return false
                if (filter('1a') && filter('1b') && filter('1c')) return true
                if (filter('2a') && filter('2b') && filter('2c')) return true
                if (filter('3a') && filter('3b') && filter('3c')) return true

                if (filter('1a') && filter('2a') && filter('3a')) return true
                if (filter('1b') && filter('2b') && filter('3b')) return true
                if (filter('1c') && filter('2c') && filter('3c')) return true

                if (filter('1a') && filter('2b') && filter('3c')) return true
                if (filter('1c') && filter('2b') && filter('3a')) return true
                return false
            }

            function gerarLayout() {
                const canvas = createCanvas(ladoQuadrado, ladoQuadrado)
                const ctx = canvas.getContext('2d')

                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, 0, ladoQuadrado, ladoQuadrado)

                ctx.fillStyle = '#000000'
                ctx.fillRect(ladoQuadrado / 3, 0, larguraBarra, ladoQuadrado)
                ctx.fillRect((ladoQuadrado / 3) * 2, 0, larguraBarra, ladoQuadrado)
                ctx.fillRect(0, ladoQuadrado / 3, ladoQuadrado, larguraBarra)
                ctx.fillRect(0, (ladoQuadrado / 3) * 2, ladoQuadrado, larguraBarra)

                return { canvas, ctx }
            }

            async function getXAndO() {
                const x = await loadImage('https://i.imgur.com/jgAG518.png')
                const o = await loadImage('https://i.imgur.com/Q7TUvsh.png')
                return {
                    xImagem: x,
                    oImagem: o
                }
            }

            function insertElement(position) {
                // c Significa Coluna
                const element1c = ladoQuadrado / 3 - 85
                const element2c = ladoQuadrado / 2 - 30
                const element3c = ladoQuadrado - 80
                const allPositions = {
                    '1a': { xPosition: element1c, yPosition: element1c },
                    '2a': { xPosition: element1c, yPosition: element2c },
                    '3a': { xPosition: element1c, yPosition: element3c },
                    '1b': { xPosition: element2c, yPosition: element1c },
                    '2b': { xPosition: element2c, yPosition: element2c },
                    '3b': { xPosition: element2c, yPosition: element3c },
                    '1c': { xPosition: element3c, yPosition: element1c },
                    '2c': { xPosition: element3c, yPosition: element2c },
                    '3c': { xPosition: element3c, yPosition: element3c },
                }
                return allPositions[position]
            }

        } catch (e) { console.log(e), msg.channel.send(`Ops, Ocorreu um Erro ,Tente novamente.`) }
    }
}

