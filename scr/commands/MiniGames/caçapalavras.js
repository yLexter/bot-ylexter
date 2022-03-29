const { MessageEmbed } = require("discord.js");
const games = new Map();
const wait = require('util').promisify(setTimeout);
const allPalavras = require("../../Jsons/caçapalavras.json").palavras
const { secondsToText } = require("../../Functions/Utils")

module.exports = {
    name: "caçapalavras",
    help: "Caça palavras tradicional",
    type: 'fun',
    cooldown: 5,
    aliase: ["cp"],
    execute: async (client, msg, args, cor) => {
        try {

            const game = games.get(msg.author.id)
            const invativity = 2
            const timeToStart = 10
            const timeEnd = 10

            if (game) return msg.reply('**❌| Você já está jogando um caça palavras!\nAguarde o jogo terminar para começar outro.**');

            const { structure, structureFillX, positionWords } = await getHuntingWords()
            const sizeWords = positionWords.length
            const stringHuntingWordFillX = getStringStructure(structureFillX)
            const stringHuntingWord = getStringStructure(structure)
            const embedInicial = new MessageEmbed()
                .setTitle('Regras do Caça Palavras')
                .setColor(cor)
                .addFields(
                    { name: 'Tempo', value: `Você tem ${timeEnd} minutos para completar o Caça palavras, Caso não ache uma palavra por mais ${invativity} minutos, o jogo acabará` },
                    { name: `Palavras`, value: `Há no total ${sizeWords} Palavras.` },
                    { name: `Embaralhamento`, value: `As palavras podem estar na vertical, horizontal, e invertidas! Ex: pedra => ardep` },
                )
                .setFooter({ text: `O Jogo irá começar em ${timeToStart}s` })
            var msgPrincipal = await msg.channel.send({ embeds: [embedInicial] })

            await wait(timeToStart * 1000)
            newGame(msg.author.id)
            editEmbedGame(stringHuntingWord, stringGame())

            const collector = msg.channel.createMessageCollector({
                filter: m => { return msg.author.id == m.author.id && positionWords.some(x => { return x.wordName.toLowerCase() == m.content.toLowerCase() }) },
                time: timeEnd * 60 * 1000,
                idle: invativity * 60 * 1000
            });

            collector.on('collect', async m => {
                const word = m.content.toUpperCase()
                const game = games.get(msg.author.id)
                if (game.rightWords.includes(word)) {
                    return msg.channel.send('❌| Ops, Esta palavra já foi encontrada.')
                }
                game.rightWords.push(word)
                games.set(msg.author.id, game)
                disableWord(word)
                editEmbedGame(getStringStructure(structure), stringGame())
                if (game.rightWords.length == sizeWords) collector.stop();

            });

            collector.on('end', async collected => {
                const game = games.get(msg.author.id)
                const { rightWords, time } = game
                if (rightWords.length == sizeWords) {
                    const timer = (Date.now() - time) / 1000
                    const string = `**🏆| Paarabéns!\n🔰 Você concluiu o caça palavras!\n⏰ Tempo\`${secondsToText(timer)}\`.**`
                    editEmbedGame(stringHuntingWordFillX, string)
                    return games.delete(msg.author.id)
                }
                const reimaningWords = positionWords.filter(x => { return !rightWords.includes(x.wordName.toUpperCase()) }).map(x => { return x.wordName.toLowerCase() }).join(", ")
                const string = `**❌| Ops, não foi dessa vez!\n🔰 Você achou ${rightWords.length}/${sizeWords} (${Math.round((rightWords.length / sizeWords) * 100)}%) das palavras.\n📑 Palavras não encontradas \`${reimaningWords}\`**`
                editEmbedGame(stringHuntingWordFillX, string)
                games.delete(msg.author.id)
            })

            async function getHuntingWords() {
                const alfabeto = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase()
                const idHorizontal = 'horizontal'
                const idVertical = 'vertical'
                const maxCaractere = 23
                const structure = getStructure()
                const structureFillX = getStructure('x')
                const sizeColumn = Object.keys(structure).length
                const randomNumber1 = getRandomInt(0, allPalavras.length - 20)
                const palavras = allPalavras
                    .map(x => { return x.toUpperCase() })
                    .slice(randomNumber1, randomNumber1 + getRandomInt(10, 20))
                const positionWords = []

                function getRandomCaractere() {
                    return alfabeto[Math.floor(Math.random() * alfabeto.length)]
                }

                function getRandomInt(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                function getStructure(element) {
                    const colunas = {
                        "0": [],
                        "1": [],
                        "2": [],
                        "3": [],
                        "4": [],
                        "5": [],
                        "6": [],
                        "7": [],
                        "8": [],
                        "9": [],
                        "10": [],
                        "11": [],
                        "12": [],
                        "13": [],
                        "14": [],
                        "15": [],
                        "16": [],
                        "17": [],
                        "18": [],
                        "19": [],
                        "20": [],
                        "21": [],
                        "22": [],
                    }
                    for (indice in colunas) {
                        let colunaAtual = colunas[indice]
                        for (let x = 0; x < maxCaractere; x++) {
                            let fill = element || getRandomCaractere()
                            colunaAtual.push(fill)
                            if (x == maxCaractere - 1) {
                                colunaAtual.push('    \n')
                            }
                        }
                    }
                    return colunas
                }

                async function injectWordVertical(word, column, position) {
                    for (indice in structure) {
                        const colunaAtual = structure[column]
                        const colunaAtualX = structureFillX[column]
                        const letra = word[indice]
                        if (!letra) break
                        colunaAtual.splice(position, 1, letra)
                        colunaAtualX.splice(position, 1, letra)
                        column++
                    }
                }

                async function injectWordHorizontal(word, column, position) {
                    const columnAtual = structure[column]
                    const columnAtualX = structureFillX[column]
                    for (indice in word) {
                        columnAtual.splice(position, 1, word[indice])
                        columnAtualX.splice(position, 1, word[indice])
                        position++
                    }
                }

                async function insertRandomWord() {
                    const functions = ['injectWordHorizontal', 'injectWordVertical']
                    const limitError = 10000
                    const porcentagem = 8
                    let number = 0
                    let wordNumber = 0
                    let noError = 0
                    const randomInvert = (word) => {
                        return getRandomInt(0, 10) > porcentagem ? invertWord(word) : word
                    }
                    const objectFunctions = {
                        'injectWordHorizontal': async () => {
                            while (true) {
                                const palavra = palavras[wordNumber]
                                const randomColumn = getRandomInt(0, sizeColumn - 1)
                                const randomPosition = getRandomInt(0, maxCaractere - 1)
                                let verify = await verifyPositionWord(randomColumn, randomPosition, idHorizontal, palavra)
                                if (noError > limitError) throw new Error('Anti Looping infinito')
                                if (!verify) {
                                    const wordInverted = randomInvert(palavra)
                                    injectWordHorizontal(wordInverted, randomColumn, randomPosition)
                                    storePlayed(randomColumn, randomPosition, palavra, idHorizontal)
                                    break
                                }
                                noError++
                            }
                        },
                        'injectWordVertical': async () => {
                            while (true) {
                                const palavra = palavras[wordNumber]
                                const randomPosition = getRandomInt(0, maxCaractere - 1)
                                const randomColumn = getRandomInt(0, (sizeColumn - palavra.length - 1))
                                let verify = await verifyPositionWord(randomColumn, randomPosition, idVertical, palavra)
                                if (noError > limitError) throw new Error('Anti Looping infinito')
                                if (!verify) {
                                    const wordInverted = randomInvert(palavra)
                                    injectWordVertical(wordInverted, randomColumn, randomPosition)
                                    storePlayed(randomColumn, randomPosition, palavra, idVertical)
                                    break
                                }
                                noError++
                            }
                        }
                    }
                    async function start() {
                        if (palavras.length == wordNumber) return;
                        await objectFunctions[functions[number]]()
                        wordNumber++
                        number == 0 ? number++ : number--
                        await start()
                    }
                    await start()
                }

                function storePlayed(column, position, word, type) {
                    let object = {
                        wordName: word,
                        type,
                        letterColumn: column,
                        firstPosition: position,
                        sizeWord: word.length,
                        allPosition: []
                    }
                    type == idHorizontal ? position : position = column
                    for (x = position; x < position + word.length; x++) {
                        object.allPosition.push(x)
                    }
                    positionWords.push(object)
                }

                async function verifyPositionWord(column, position, type, word) {
                    const types = {
                        'horizontal': () => {
                            let verify = false
                            const equivalentColumn = positionWords
                                ?.filter(x => { return x.type == idHorizontal && x.letterColumn == column })

                            if (position - word.length < 0 || position + word.length > maxCaractere) return true

                            for (element of equivalentColumn) {
                                for (x = position; x <= position + word.length; x++) {
                                    if (element?.allPosition.includes(x)) {
                                        verify = true
                                        break
                                    }
                                }
                            }
                            const equivalentPosition = positionWords
                                .filter(x => { return x.type == idVertical })
                                .find(x => { return x.allPosition.includes(column) })
                            if (equivalentPosition) verify = true
                            return verify
                        },
                        'vertical': () => {
                            let verify = false
                            const equivalentColumn = positionWords
                                .filter(x => { return x.type == idVertical && x.firstPosition == position })

                            if (column - word.length < 0 || column + word.length > sizeColumn || position > maxCaractere) return true

                            for (element of equivalentColumn) {
                                for (x = column; x <= column + word.length; x++) {
                                    if (element?.allPosition.includes(x)) {
                                        verify = true
                                        break
                                    }
                                }
                            }
                            const equivalentPosition = positionWords
                                .filter(x => { return x.type == idHorizontal })
                                .find(x => { return x.allPosition.includes(position) })
                            if (equivalentPosition) verify = true
                            return verify
                        }
                    }
                    return await types[type]()
                }
                function invertWord(word) {
                    return word
                        .split("")
                        .reverse()
                        .join("")
                }
                await insertRandomWord()
                return {
                    structure,
                    structureFillX,
                    positionWords,
                }
            }

            function disableWord(wordName) {
                const elementDisable = '*'
                const word = positionWords.find(x => x.wordName == wordName.toUpperCase())
                const { firstPosition, sizeWord, letterColumn, type } = word
                const objectFunctions = {
                    'horizontal': () => {
                        const column = structure[letterColumn]
                        for (x = firstPosition; x < firstPosition + sizeWord; x++) {
                            column.splice(x, 1, elementDisable)
                        }
                    },
                    'vertical': () => {
                        for (x = letterColumn; x < letterColumn + sizeWord; x++) {
                            const atualColumn = structure[x]
                            atualColumn.splice(firstPosition, 1, elementDisable)
                        }
                    }
                }
                objectFunctions[type]()
            }

            function getStringStructure(structure) {
                let allCaracteres = [""]
                for (indice in structure) {
                    const colunaAtual = structure[indice]
                    for (caractere of colunaAtual) {
                        allCaracteres.push(caractere)
                    }
                }
                return allCaracteres.join(" ")
            }

            function newGame(id) {
                let game = {
                    rightWords: [],
                    time: Date.now(),
                }
                games.set(id, game)
            }

            function embedGame(string) {
                let game = games.get(msg.author.id)
                let rightWords = !game.rightWords.length ? 'Nenhuma' : game.rightWords.map(x => { return x.toLowerCase() }).join(", ")
                return new MessageEmbed()
                    .setAuthor({ name: `| ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() })
                    .setTitle('Caça Palavras Tradicional')
                    .setColor(cor)
                    .setDescription(`\`\`\`txt\n${string}\n\`\`\`\n`)
                    .setFooter({ text: `Palavras encontradas: ${rightWords}` })
            }

            function editEmbedGame(string, stringGame) {
                return msgPrincipal.edit({ content: stringGame, embeds: [embedGame(string)] }).catch(() => { games.delete(msg.author.id) })
            }

            function stringGame() {
                let game = games.get(msg.author.id)
                return `**📑 Total de Palavras \`${game.rightWords.length}/${sizeWords}\`\n⏰ Tempo Restante \`${secondsToText((Date.now() - game.time) / 1000)}/${timeEnd}:00\`**`
            }

        } catch (e) {
            games.delete(msg.author.id)
            const embedError = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() })
                .setDescription('Ops, Parece que houve um erro inesperado, tente novamente.')
                .setFooter({ text: 'Erro por que o bot provavelmente não conseguiu gerar o caça palavras.' })
            return msg.channel.send({ embeds: [embedError] })
        }

    }
};

