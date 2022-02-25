let { MessageEmbed, MessageCollector } = require("discord.js");
const config = require("./palavras.json");
const wait = require('util').promisify(setTimeout);

module.exports = {
  name: "gameshuffle",
  help: "Inicia o jogo do embaralhamento",
  type: "fun",
  aliase: ["gamesh"],
  execute: async (client, msg, args, cor) => {

    try {
      let shuffle = client.shuffles.get(msg.guild.id)

      if (shuffle) {
        if (!args[0]) return;
        const { owner, status } = shuffle
        const totalPalavras = config.palavras.length - 1
        const numberQuestions = timeResposta = Math.floor(Number(args[1]))
        const gameConfig = args[0].toLowerCase()
        const errorMsg = () => {
          return msg.reply({ content: 'Ocorreu um Erro ao Tentar Definir as configurações , Tente novamente. Use: Command + Config + Parâmentro' })
        }

        if (msg.author.id != owner || status) {
          const helpMsg = new MessageEmbed()
            .setColor(cor)
            .addFields(
              { name: "**Dono**", value: `Você não é o criador do jogo , o criador é o/a <@${owner}>` },
              { name: "**Jogo em progresso**", value: 'Há um jogo em andamento' },
            )
            .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
          msg.channel.send({ embeds: [helpMsg] })
        }

        const configsGame = [
          {
            name: 'questions',
            help: `Utilize um número inteiro positivo maior 3 e menor ou igual á ${totalPalavras}`,
            run: async () => {
              let shuffle = client.shuffles.get(msg.guild.id)
              if (!numberQuestions || numberQuestions < 3 || numberQuestions > totalPalavras || isNaN(numberQuestions)) return errorMsg();
              shuffle.questionsWin = numberQuestions
              msg.reply({ content: `A quantidade de questões para vencer o jogo foi definido para ` + `\`${numberQuestions}\`.` })
              return client.shuffles.set(msg.guild.id, shuffle)
            }
          },
          {
            name: 'tempo',
            help: `Utilize um número maior que 60 e menor que 600 para definir o tempo de respota , em (s)`,
            run: async () => {
              let shuffle = client.shuffles.get(msg.guild.id)
              if (!timeResposta || timeResposta < 60 || timeResposta > 600 || isNaN(timeResposta)) return errorMsg();
              shuffle.tempo = timeResposta
              msg.reply({ content: `O tempo para responder jogo as perguntas foi definido para ` + `\`${timeResposta}\`s.` })
              return client.shuffles.set(msg.guild.id, shuffle)
            }
          },
        ]

        const verify = configsGame.find(x => { return x.name == gameConfig })

        if (!verify) {
          const string = configsGame.map(element => {
            return `**Config**: ${element.name}\n**Help:** ${element.help}`
          }).join("\n\n")

          const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setDescription(string)
            .setAuthor({ name: `| Configs Disponiveis `, iconURL: msg.author.displayAvatarURL() })
            .setFooter({ text: 'Exemplo: +gamesh tempo 120, Define o Tempo Para responder para 120s' })
          return msg.channel.send({ embeds: [helpMsg] })
        } else return await verify.run();

      }

      shuffle = {
        players: [newPlayer(msg.author.id, msg.author.tag)],
        rodada: 0,
        afk: 0,
        owner: msg.author.id,
        status: null,
        questionsWin: 3,
        tempo: 60
      }

      client.shuffles.set(msg.guild.id, shuffle)

      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .addFields(
          { name: '**Como Jogar**', value: 'O bot irá dizer uma palavra embaralhada e você terá que acertar qual é.' },
          { name: '**Tempo limite  para responder corretamente**', value: 'Padrão: 60s' },
          { name: '**Como entrar no jogo**', value: 'Digite: !join' },
          { name: '**Vencedor**', value: 'Padrão - 3pts' },
          { name: '**Quantidade Minima de jogadores**', value: '2' },
          { name: '**Início**', value: 'O Dono do game tem 5min para startar ou o jogo será cancelado.' },
          { name: 'Dono', value: `O dono do jogo é o <@${shuffle.owner}> , Portanto só ele que poderá startar o game e todas as configurações é ele que define.` },
          { name: "Configs", value: 'Ao dono do game , utilize: `Comando + configs` para ver as configs disponiveis ' }
        )
        .setAuthor({ name: `| 🏆 Jogo Do Embaralhamento: `, iconURL: msg.author.displayAvatarURL() })
      msg.channel.send({ embeds: [helpMsg] })

      const filter = m => {
        return msg.channel.id === m.channel.id
      }

      const collector = msg.channel.createMessageCollector({ filter, time: 300 * 1000 });

      collector.on('collect', async m => {

        let shuffle = client.shuffles.get(msg.guild.id)
        const msgContent = m.content.toLowerCase()
        const ownerMsg = () => {
          return msg.channel.send({ content: `O Dono do jogo é o <@${shuffle.owner}> , Portanto só ele que poderá configurar o jogo.` })
        }

        const objects = {
          '!start': async () => {
            if (shuffle.owner == m.author.id) {
              shuffle.status = true
              client.shuffles.set(msg.guild.id, shuffle)
              return collector.stop()
            }
          },
          '!join': async () => {
            let shuffle = client.shuffles.get(msg.guild.id)
            let verify = shuffle.players.find(element => element.id == m.author.id)
            if (verify) {
              m.reply({ content: '❌ | Você já está participando do jogo.' })
            } else {
              shuffle.players.push(newPlayer(m.author.id, m.author.tag)),
                client.shuffles.set(msg.guild.id, shuffle)
              m.reply({ content: '✔️ | Sucesso: Você está participando do jogo.' })
            }
          },
          '!cancel': async () => {
            if (shuffle.owner === m.author.id) {
              shuffle.status = 'canceled'
              client.shuffles.set(msg.guild.id, shuffle)
              return collector.stop()
            } else ownerMsg()
          }
        }

        try {
          await objects[msgContent]()
        } catch (e) { return }

      });


      collector.on('end', async collected => {
        const shuffle = client.shuffles.get(msg.guild.id)
        const minPlayers = 1

        if (shuffle.players.length <= minPlayers || shuffle.status == 'canceled' || !shuffle.status) {
          msg.channel.send({ content: '❌ O Jogo foi Cancelado!' })
          return client.shuffles.delete(msg.guild.id)
        }

        return game()

      })

      function newPlayer(id, nome) {
        const player = new Object()
        player.id = id
        player.nome = nome
        player.pontos = 0
        return player
      }

      function embaralhar(string) {
        return string
          .split('')
          .sort(() => (0.5 - Math.random()))
          .join('')
          .toLowerCase();
      };

      function players_ordenados() {
        let shuffle = client.shuffles.get(msg.guild.id)
        let ordanar = shuffle.players.sort((x, y) => {
          return y.pontos - x.pontos
        })
        client.shuffles.set(msg.guild.id, shuffle)
        const string = shuffle.players.map((element, index) => {
          let contador = index + 1
          return `**${contador}. ${element.nome}** - pts: ${element.pontos}`
        }).join('\n');

        return string
      }

      function endGame(champion) {
        const string_2 = players_ordenados()
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setDescription(`**Parabéns <@${champion.id}> Por Ter Vencido o Jogo Do Embaralhamento!** \n\n **🔰 Placar Geral**\n${string_2}`)
          .setAuthor({ name: `| 🏆 Campeão`, iconURL: client.user.displayAvatarURL() })
        msg.channel.send({ embeds: [helpMsg] })
        return client.shuffles.delete(msg.guild.id)
      }

      function championGame() {
        const shuffle = client.shuffles.get(msg.guild.id)
        return shuffle.players.find(element => element.pontos == shuffle.questionsWin)
      }

      async function game() {
        const shuffle = client.shuffles.get(msg.guild.id)
        const palavra_aleatoria = config.palavras[Math.floor(Math.random() * config.palavras.length)];
        const palavra_embaralhada = embaralhar(palavra_aleatoria)

        const filter = m => {
          return shuffle.players.find(element => element.id == m.author.id) && m.content.toLowerCase() == palavra_aleatoria.toLowerCase() && msg.channel.id === m.channel.id
        }

        const collector = msg.channel.createMessageCollector({ filter, max: 1, time: shuffle.tempo * 1000 })

        await wait(1.5 * 1000)
        msg.channel.send({ content: '**A Palavra será lançada em 5s**' })
        await wait(5 * 1000)
        msg.channel.send({ content: 'Qual é a palavra? => ' + `\`${palavra_embaralhada}\`` })

        collector.on('collect', m => {
          msg.channel.send({ content: `O Player **${m.author.username}** acertou a palavra que era => ` + `\`${palavra_aleatoria}\`` });

          let shuffle = client.shuffles.get(msg.guild.id)
          const player = shuffle.players.find(element => element.id == m.author.id)

          player.pontos++
          shuffle.rodada++
          client.shuffles.set(msg.guild.id, shuffle)

          const verify = championGame()
          const string = players_ordenados()

          const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setDescription(`${string}`)
            .setAuthor({ name: `| Rodada: ${shuffle.rodada}`, iconURL: client.user.displayAvatarURL() })
          if (!verify) return msg.channel.send({ embeds: [helpMsg] })

        })

        collector.on('end', async collected => {

          const verify2 = collected.size
          const shuffle = client.shuffles.get(msg.guild.id)
          const champion = championGame()
          const afk = 10

          if (verify2 == 0) {
            msg.channel.send(`Ninguem acertou a palavra! a palavra correta era => ` + `\`${palavra_aleatoria}\``)
            shuffle.afk++
            shuffle.rodada++
            client.shuffles.set(msg.guild.id, shuffle)
          }

          if (shuffle.afk == afk) {
            client.shuffles.delete(msg.guild.id)
            return msg.channel.send(`Nas ultimas ${afk} palavras ninguem acertou , o jogo será encerrado por **Inatividade**`);
          }

          champion ? endGame(champion) : game()

        })

      } // End game()

    } catch (e) { msg.channel.send({ content: `\`${e}\`` }) }
  }
}




























































