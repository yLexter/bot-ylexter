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
            const sizeX = 80
            const sizeO = 55
            const timeUserAccept = 60
            const emojiReact = '✅'
            const adversario = msg.mentions.members.first() || msg.guild.members.cache.get(args[0])
            const { xImagem, oImagem } = await getXAndO()
            const buscarPlayer = idPlayer => { return [...games?.values()].find(x => x.players.find(y => y == idPlayer)) }

            if (!adversario) return msg.reply('❌| Ops! , Você precisa mencionar algúem para jogar.');
            if (msg.author.id == adversario.user.id) return msg.reply('🚫| Você não pode jogar contra si mesmo, é muito fácil.')
            if (adversario.user.id == client.user.id) return msg.reply('❌| Nem tenta , eu ganho fácil.')
            if (adversario.user.bot) return msg.reply('❌| Você não pode jogar contra bots , eles só são inteligente no xadrez.');
            if (buscarPlayer(msg.author.id) || buscarPlayer(adversario.user.id)) return msg.reply('❌| Ops! Você ou seu adversário já estão em uma partida.')

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ${msg.author.username} vs ${adversario.user.username} `, iconURL: msg.author.displayAvatarURL() })
                .setImage('https://i.imgur.com/JIAbZhp.png')
                .setDescription('Para jogar, digite a coordenada que queira, por exemplo **2a**.')
                .setFooter({ text: 'Caso o Adversário não reaga , a partida será cancelada!' })
            const msgPrincipal = await msg.channel.send({ content: `<@${adversario.user.id}>`, embeds: [helpMsg] })

            await msgPrincipal.react(emojiReact)

            const filter = (reaction, user) => { return reaction.emoji.name == emojiReact && user.id == adversario.user.id }
            const collector = msgPrincipal.createReactionCollector({ filter, time: timeUserAccept * 1000, max: 1 })

            collector.on('collect', (reaction, user) => { collector.stop() });

            collector.on('end', async collected => {
                try {
                    if (collected.size == 0) return msg.channel.send({ content: '❌ O Adversário não aceitou o Desafio.' });

                    let game = games.get(msg.author.id)

                    if (!game) {
                        msg.channel.send({ content: `${emojiReact} O Jogo vai começar.` })
                        newGame(msg.author.id, adversario.user.id)
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

                            if (m.author.id != game.vez) return m.reply({ content: '⚠️ | Não é sua vez de jogar!' })
                            if (verifyJogada) return m.reply({ content: '❌| Essa Jogada já foi feita , escolha outra.' })

                            const jogadaFeita = jogadasPossiveis.find(x => { return x == jogadaPlayer })
                            jogadasFeitas.push({ jogador: game.vez, jogadaFeita })

                            player == jogadorX ? game.vez = jogadorY : game.vez = jogadorX
                            games.set(msg.author.id, game)

                            await wait(0.5 * 1000)

                            const winner = verifyWinner(player)
                            const imageUpdated = getImageUpdated()
                            const file = new MessageAttachment(imageUpdated.toBuffer(), 'imagemAtt.png')

                            if (winner) {
                                collector.stop()
                                return msgSecundaria.edit({ content: `🏆 Vencedor\nO <@${player}> Venceu o jogo da velha!`, files: [file] })
                            }

                            if (jogadasFeitas.length == jogadasPossiveis.length) {
                                collector.stop()
                                return msgSecundaria.edit({ content: '🏆 Velhaa!\nNinguém ganhou o jogo.', files: [file] })
                            }

                            return msgSecundaria.edit({ content: `🔰 Jogador X: <@${game.jogadorX}> | Jogador O: <@${game.jogadorY}> \n🔰 A vez de Jogar é de <@${game.vez}>`, files: [file] })

                        } catch (e) { console.log(e), collector.stop(), msg.channel.send({ content: '| ❌ Ops ocorreu um Erro Inesperado , o Jogo foi Cancelado , Caso pesista avise ao dono do Bot.' }) }
                    });

                    collector.on('end', collected => { games.delete(msg.author.id) });

                } catch (e) { games.delete(msg.author.id) }

            });

            function getImageUpdated() {
                let game = games.get(msg.author.id)
                const { canvas, ctx } = gerarLayout()
                for (let jogada of game.jogadasFeitas) {
                    let element = jogada.jogador == game.jogadorX ? xImagem : oImagem
                    const { xPosition, yPosition } = insertElement(jogada.jogadaFeita)
                    const elementSize = element == xImagem ? sizeX : sizeO
                    ctx.drawImage(element, xPosition, yPosition, elementSize, elementSize)
                }
                return canvas
            }

            function newGame(challenger, challenged) {
                velha = {
                    players: [challenger, challenged],
                    vez: null,
                    jogadasFeitas: [],
                    jogadorX: null,
                    jogadorY: null,
                }
                velha.vez = velha.players[Math.floor(Math.random() * velha.players.length)]
                velha.jogadorX = velha.players[0]
                velha.jogadorY = velha.players[1]
                games.set(challenger, velha)
            }

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
                const element1c = ladoQuadrado / 3 - 75
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

        } catch (e) { console.log(e), msg.channel.send(`❌| Ops, Ocorreu um Erro ,Tente novamente.`) }
    }
}

