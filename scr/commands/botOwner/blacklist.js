const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const Database = require('./../../Database/moongose')
const moment = require('moment')
const { ownerBotId } = require("./../../Jsons/config.json")
const Command = require('../../classes/command')

class CommandBlacklist extends Command {

    constructor() {
        super({
            name: "blacklist",
            help: "Adiciona um servidor ou um membro a blacklist.",
            type: 'ownerBot',
            cooldown: 5,
            aliase: ["bl"],
        })
    }

    async execute(client, msg, args) {

        try {
            const { cor } = client
            const type = args[0]?.toLowerCase() // Guild ou Membro
            const method = args[1]?.toLowerCase() // Add  ou Remove
            const userOrServer = (msg.mentions.members.first())?.user.id || args[2] // usuário ou servidor
            const reason = args.slice(3).join(" ") || 'Não informada' // Reason
            const methodsAdd = ['add', 'adicionar']
            const methodsDelet = ['delete', 'del']
            const allMethod = (methodsAdd.concat(methodsDelet)).join(", ")
            const data = await Database.client.findOne({ id: client.user.id })

            if (!type) return msg.reply('Informe o Tipo que você quer adicionar na black list!\nTypes: User ou Servidor.')

            if (['clearuser', 'cluser'].includes(type)) return await clearBlacklistUser()
            if (['clearguild', 'clguild'].includes(type)) return await clearBlacklistGuild()
            if (['guilds', 'servidores', 'servers'].includes(type)) return await allLogs('Guild')
            if (['users', 'membros', 'usuarios'].includes(type)) return await allLogs('User')

            if (!method) return msg.reply('Informe um método\nMétodos: Add Ou Delete')
            if (!userOrServer) return msg.reply('Você precisa informar o ID do server ou do User!')
            if (userOrServer == ownerBotId) return msg.reply('Tu tem demência seu fdp?')

            if (['user', 'membro'].includes(type)) return await blacklistUser()
            if (['guild', 'servidor', 'server'].includes(type)) return await backlistGuild()
            return msg.reply('Método Inválido!')

            async function blacklistUser() {
                const userBlacklist = data.blacklist.Users.find(x => x.id == userOrServer)

                if (userOrServer.length != 18) return msg.reply('ID inválido , os ID Tem 18 caracteres!')
                if (client.guilds.cache.get(userOrServer)) return msg.reply('Isto é um ID de um servidor!')

                if (methodsAdd.includes(method)) {
                    if (userBlacklist) return msg.reply('O user já estar na blacklist!');
                    await Database.client.findOneAndUpdate(
                        { id: client.user.id },
                        { $push: { 'blacklist.Users': logBlacklist('User') } }
                    )
                    return msg.reply(`O usuário foi adicionado na blacklist com sucesso!`)
                }

                if (methodsDelet.includes(method)) {
                    if (!userBlacklist) return msg.reply('O user não estar na blacklist!');
                    await Database.client.findOneAndUpdate(
                        { id: client.user.id },
                        { $pull: { 'blacklist.Users': { id: userOrServer } } }
                    )
                    return msg.reply(`O usuário foi removido da blacklist com sucesso!`)
                }

                return msg.reply(`Método inválido!\nTodos Os Metodos \`${allMethod}\``)

            }

            async function backlistGuild() {
                const guildBlacklist = data.blacklist.Guilds.find(x => x.id == userOrServer)

                if (userOrServer.length != 18) return msg.reply('ID inválido , os ID Tem 18 caracteres!')
                if (client.users.cache.get(userOrServer)) return msg.reply('Isto é um ID de um user!')

                if (methodsAdd.includes(method)) {
                    if (guildBlacklist) return msg.reply('a Guild já estar na blacklist!')
                    await Database.client.findOneAndUpdate(
                        { id: client.user.id },
                        { $push: { 'blacklist.Guilds': logBlacklist('Guild') } }
                    )
                    return msg.reply(`A guild foi adicionado na blacklist com sucesso!`)
                }
                if (methodsDelet.includes(method)) {
                    if (!guildBlacklist) return msg.reply('a Guild não estar na blacklist!')
                    await Database.client.findOneAndUpdate(
                        { id: client.user.id },
                        { $pull: { 'blacklist.Guilds': { id: userOrServer } } }
                    )
                    return msg.reply(`A guild foi removido da blacklist com sucesso!`)
                }
                return msg.reply(`Método invalido!\nTodos Os Metodos \`${allMethod}\``)
            }

            function logBlacklist(type) {
                const model = new Object()
                model.type = type
                model.data = moment(Date.now()).format('LLLL')
                model.reason = reason
                model.id = userOrServer
                return model
            }

            async function allLogs(typeLog) {
                const dadosBlacklist = typeLog == 'Guild' ? data.blacklist.Guilds : data.blacklist.Users
                const sizeDadosBlacklist = dadosBlacklist.length
                const finishCommand = 120
                let contador = 0
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('forward')
                            .setEmoji('◀️')
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setCustomId('rewind')
                            .setEmoji('▶️')
                            .setStyle('PRIMARY'),
                    );

                if (!sizeDadosBlacklist) return msg.reply('Não existem logs!')

                const msgPrincipal = await msg.channel.send({ embeds: [embedLogs(getLogsByPosition())], components: [row] })

                function embedLogs(dados) {
                    const { id, data, reason, type } = dados
                    return new MessageEmbed()
                        .setColor(cor)
                        .setFields(
                            { name: `🆔 ID`, value: String(id) },
                            { name: '📅 Data de inclusão', value: data, inline: true },
                            { name: '🔰 Reason', value: reason },
                        ).setAuthor({ name: `| Lista de ${type}(s)`, iconURL: msg.author.displayAvatarURL() })
                        .setFooter({ text: `Pag: ${contador + 1}/${sizeDadosBlacklist}` })
                }

                function getLogsByPosition() {
                    return dadosBlacklist[contador]
                }

                function editEmbed() {
                    let dados = getLogsByPosition()
                    return msgPrincipal.edit({ embeds: [embedLogs(dados)], components: [row] }).catch(() => { })
                }

                const filter = i => {
                    i.deferUpdate()
                    return msg.author.id == i.user.id
                }

                const collector = msgPrincipal.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: finishCommand * 1000 });

                collector.on('collect', i => {

                    const buttons = {
                        'forward': () => {
                            if (contador == 0) return;
                            contador--
                            editEmbed()
                        },
                        'rewind': () => {
                            if (contador == sizeDadosBlacklist - 1) return;
                            contador++
                            editEmbed()
                        }
                    }

                    try {
                        buttons[i.customId]()
                    } catch (e) {
                        console.log(e)
                    }

                });

                collector.on('end', collected => {
                    msgPrincipal.edit({ components: [] }).catch(() => { })
                });
            }

            async function clearBlacklistGuild() {
                await Database.client.findOneAndUpdate(
                    { id: client.user.id },
                    { 'blacklist.Guilds': [] }
                )
                return msg.reply('A blacklist das Guilds foi limpa com sucesso!')
            }

            async function clearBlacklistUser() {
                await Database.client.findOneAndUpdate(
                    { id: client.user.id },
                    { 'blacklist.Users': [] }
                )
                return msg.reply('A blacklist dos usuários foi limpa com sucesso!')
            }



        } catch (e) { msg.channel.send(`\`${e}\``) }


    }


}

module.exports = CommandBlacklist