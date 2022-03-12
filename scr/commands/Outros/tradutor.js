const translate = require("@iamtraction/google-translate");
const { MessageEmbed } = require("discord.js");
const { languages } = require('./../Outros/config_others.json')

module.exports = {
    name: "tradutor",
    help: "Traduz um texto para linguagem que desejar. Exemplo: <comando> pt welcome , traduz welcome pro português.",
    type: "others",
    cooldown: 10,
    aliase: ["tr"],
    execute: async (client, msg, args, cor) => {

        try {
            const limit = 2000
            const language = args[0]
            const text = args.slice(1).join(' ');
            const link = 'https://i.imgur.com/9kWn6Qp.png'

            if (!languages[language] || language == 'auto') {
                let arrayLanguages = Object.entries(languages)
                let string = arrayLanguages.map((element) => {
                    return `${element[0]} - ${element[1]}\n`
                }).join("")

                let embed = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: '| Linguagens Disponiveis', iconURL: link })
                    .setDescription(`\`\`\`txt\n${string}\n\`\`\`\n`)
                return msg.reply({ embeds: [embed] })
            }

            if (!text || text.length > limit) {
                return msg.reply({ content: `❌| **Informe um texto menor que ${limit} caracteres.**` })
            }

            const textTranslated = (await translate(text, { to: `${language}` })).text

            let helpMsg = new MessageEmbed()
                .setAuthor({ name: '| Google Tradutor', iconURL: link })
                .setColor(cor)
                .setDescription(`**Texto\n**` + `\`\`\`txt\n${text}\n\`\`\`\n` + '**Traduzido**\n```Bash\n' + `"${textTranslated}"` + '```')
            return msg.channel.send({ embeds: [helpMsg] })

        } catch (e) {
            msg.channel.send(`\`${e}\``)
        }
    }
}









