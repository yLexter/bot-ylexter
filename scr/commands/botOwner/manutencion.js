const { MessageEmbed } = require("discord.js");
const Database = require('./../../Database/moongose')
const moment = require('moment')
const Command = require('../../classes/command')

class CommandManutencion extends Command {
    constructor() {
        super({
            name: "maintenance",
            help: "Adiciona um comando a manuteção.",
            type: 'ownerBot',
            cooldown: 5,
            aliase: ["man"],
        })
    }

    async execute(client, msg, args) {

        try {
            const { cor } = client
            const method = args[0]?.toLowerCase()
            const command = args[1]?.toLowerCase()
            const reason = args.slice(2).join(" ") || 'Não Informada'
            const commands = client.commands.map(x => { return x.name })
            const data = await Database.client.findOne({ id: client.user.id })
            const commandDatabse = data?.commandsMan?.find(x => { return x.name == command })

            if (!method) return msg.reply(`Você não digitou nenhum método , cabeça de pomba.`);

            if (["deletarall", "delall", 'delec'].includes(method)) return await deleteCommands()
            if (['lista', 'list', 'all'].includes(method)) return await listCommands()

            if (!commands.includes(command)) {
                return msg.reply(`Comando Inválido!\nTodos os Comandos: \`${commands.join(", ")}\``)
            }

            if (command == 'maintenance') return msg.reply('Tu tem demência é?????')

            if (["add", "adicionar"].includes(method)) return await addCommand()
            if (["delete", "del", "remover"].includes(method)) return await delCommand()
            return msg.reply('Método inválido!')


            async function addCommand() {
                if (commandDatabse) return msg.reply('Este commando já está na lista!')

                const object = {
                    name: command,
                    reason,
                    data: moment(Date.now()).format('LLLL')
                }

                await Database.client.findOneAndUpdate(
                    { id: client.user.id },
                    { $push: { commandsMan: object } }
                )

                return msg.reply(`Sucesso!\nO Comando \`${command}\` foi Adicionado a lista de manuteção.`)
            }

            async function delCommand() {
                if (!commandDatabse) return msg.reply('Este commando não está na lista!')
                await Database.client.findOneAndUpdate(
                    { id: client.user.id },
                    { $pull: { commandsMan: { name: command } } }
                )
                return msg.reply(`Suceso!\nO comando \`${command}\` foi removido da lista de manuteção!`)
            }

            async function deleteCommands() {
                await Database.client.findOneAndUpdate(
                    { id: client.user.id },
                    { commandsMan: [] }
                )
                return msg.reply('Os comandos de manuteção foi limpo com sucesso!')
            }

            async function listCommands() {
                if (!data.commandsMan.length) return msg.reply('Não existem comandos em manuteção!');

                let stringCommands = data.commandsMan.map(command => {
                    return `**Comando \`${command.name}\`\nMotivo \`${command.reason}\`\nData \`${command.data}\`**`
                }).join("\n\n")

                let embed = new MessageEmbed()
                    .setColor(cor)
                    .setTitle('Comandos em Manuteção')
                    .setDescription(stringCommands)
                return msg.channel.send({ embeds: [embed] })
            }

        } catch (e) { msg.channel.send(`\`${e}\``) }


    }
}

module.exports = CommandManutencion