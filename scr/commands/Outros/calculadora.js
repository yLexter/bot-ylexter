const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    name: "calculadora",
    help: "Calculadora tradicional.",
    type: "others",
    cooldown: 60,
    aliase: ["calc"],
    execute: async (client, msg, args, cor) => {
        try {
            const generateComponents = () => {
                const row1 = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId('clear').setLabel('C').setStyle('DANGER'),
                    new MessageButton().setCustomId('(').setLabel('(').setStyle('PRIMARY'),
                    new MessageButton().setCustomId(')').setLabel(')').setStyle('PRIMARY'),
                    new MessageButton().setCustomId('delete').setLabel('⌫').setStyle('DANGER')
                );
                const row2 = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId('7').setLabel('7').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('8').setLabel('8').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('9').setLabel('9').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('/').setLabel('/').setStyle('PRIMARY')
                );
                const row3 = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId('4').setLabel('4').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('5').setLabel('5').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('6').setLabel('6').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('*').setLabel('*').setStyle('PRIMARY')
                );
                const row4 = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId('1').setLabel('1').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('2').setLabel('2').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('3').setLabel('3').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('-').setLabel('-').setStyle('PRIMARY')
                );
                const row5 = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId('0').setLabel('0').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('.').setLabel('.').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('=').setLabel('=').setStyle('SUCCESS'),
                    new MessageButton().setCustomId('+').setLabel('+').setStyle('PRIMARY')
                );
                return [row1, row2, row3, row4, row5];
            };

            const embed = (value) => {
                return new MessageEmbed()
                    .setAuthor({ name: '| Calculadora', iconURL: msg.author.displayAvatarURL() })
                    .setColor(cor)
                    .setFooter({ text: `©️ Copyright All Rights Reserved ` })
                    .setDescription(`\`\`\`txt\n${value}\n                             ⠀\n\`\`\`\n`)
            }

            let values = ['0']
            const finishCommmand = 120
            const operations = ['*', '/', '+', '-']
            const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
            const msgPrincipal = await msg.channel.send({ embeds: [embed('0')], components: generateComponents() })
            const editMsg = (valor) => {
                return msgPrincipal.edit({ embeds: [embed(valor)], components: generateComponents() })
            }
            const filter = i => {
                i.deferUpdate()
                return i.user.id == msg.author.id
            }

            msgPrincipal.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: finishCommmand * 1000, max: 40 })
                .on('collect', i => {
                    const inputUser = i.customId
                    const lastValue = values[values.length - 1]

                    const checkInput = (x) => {
                        return x.includes(inputUser)
                    }
                    const editMsgAndPushValue = (value) => {
                        values.push(String(value))
                        return editMsg(values.join(""))
                    }

                    if (values.length > 30) return;

                    if (checkInput(operations) && operations.includes(lastValue)) {
                        if (lastValue == inputUser) return;
                        values.pop()
                        return editMsgAndPushValue(inputUser)
                    }

                    if (values.length == 1 && values[0] == '0' && checkInput(numbers)) {
                        values.pop();
                    }

                    let buttons = {
                        '.': () => {
                            let lastNumber = values
                                .map(x => { return operations.includes(x) ? '|' : x })
                                .join("")
                                .split("|")
                                .pop()
                            if (lastNumber.includes('.')) return;
                            editMsgAndPushValue('.')
                        },
                        '=': () => {
                            try {
                                if (operations.includes(lastValue)) return;
                                let valor = values.length == 0 ? '0' : eval(values.join(""))
                                editMsg(valor)
                                return values = [valor]
                            } catch (e) {
                                editMsg('Input Inválido')
                                values = ['0']
                            }
                        },
                        'delete': () => {
                            if (values.length == 1 && values[0] == '0') return;
                            values.pop()
                            let valor = values.length == 0 ? '0' : values.join("")
                            return editMsg(valor)
                        },
                        'clear': () => {
                            values = []
                            editMsgAndPushValue('0')
                        },
                    }

                    try {
                        if (buttons[inputUser]) return buttons[inputUser]();
                        return editMsgAndPushValue(inputUser)
                    } catch (e) {
                        values = ['0']
                    }

                })

                .on('end', collected => {
                    let embed = new MessageEmbed()
                        .setColor(cor)
                        .setAuthor({ name: 'O tempo de usar a calculadora acabou', iconURL: msg.author.displayAvatarURL() })
                    return msgPrincipal.edit({ components: [], embeds: [embed] }).catch(() => { })
                })

        } catch (e) {
            return msg.channel.send(`\`${e}\``)
        }
    }
};