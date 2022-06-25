const { MessageEmbed } = require("discord.js");
const { cdCmd } = require("../../Jsons/config.json")
const Command = require('../../classes/command')

class CommandHelp extends Command {
    constructor() {
        super({
          name: "help",
          help: "Exibe uma lista de todos os comandos",
          type: "others",
          aliase: [],
        })
    }

    async execute(client, msg, args) {

        const { cor } = client
        try {
          let string = ``
          const s = args.join(" ")
          const allCommands = client.commands.filter(x => { return x.type != 'ownerBot' })
          const info = allCommands.find(y => y.name == s.toLowerCase()) || allCommands.find(x => x.aliase.find(y => y.toLowerCase() == s.toLowerCase()))
          const ordenados = agruparPor(allCommands, 'type')
    
          if (info) {
            const cdCommand = info.cooldown || cdCmd
            const stringAliase = info.aliase.length > 0 ? info.aliase.join(", ") : 'Não Definido'
            const usage = info.usage || `<Comando>`
            const helpMsg = new MessageEmbed()
              .setColor(cor)
              .setAuthor({ name: ' | 🛠️ Informação do Comando', iconURL: msg.author.displayAvatarURL() })
              .setDescription(`**Comando **\`${info.name}\`\n**Descrição ** \`${info.help}\`\n **Usage ** \`${usage}\`\n  **Aliase's **  \`${stringAliase}\`\n**Cooldown ** \`${cdCommand}\``)
            return msg.channel.send({ embeds: [helpMsg] })
          }
    
          function agruparPor(objetoArray, propriedade) {
            return objetoArray.reduce((acc, obj) => {
              let key = obj[propriedade];
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(obj);
              return acc;
            }, {});
          }
    
          for (x in ordenados) {
            let key = ordenados[x]
            let total = key.length
            let nome = x[0].toUpperCase() + x.slice(1, x.length) + ' commands'
    
            string += `**${nome}[${total}]**\n`
    
            key.forEach((command, index) => {
              let contador = index + 1
              let name = command.name
              if (contador != total) {
                contador % 4 == 0 ? string += `\`${name}\`, \n` : string += `\`${name}\`, `
              } else {
                string += `\`${name}\` \n\n`
              }
            })
          }
    
          const helpMsg = new MessageEmbed()
            .setColor(cor)
            .setAuthor({ name: ' | 🛠️ Commands', iconURL: msg.author.displayAvatarURL() })
            .setDescription(string)
            .setFooter({ text: 'Detalhes do comando, use help + <comando>.' })
          return msg.channel.send({ embeds: [helpMsg] })
    
        } catch (e) { msg.channel.send(`\`${e}\``) }        
    }
}

module.exports = CommandHelp


