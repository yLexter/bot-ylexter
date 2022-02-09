const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  help: "Exibe uma lista de todos os comandos",
  type: "others",
  aliase: [],
  execute: async (client, msg, args, cor) => {

    try {
      var string = ``
      const s = args.join(" ")
      const info = client.commands.find(y => y.name == s.toLowerCase()) || client.commands.find(x => x.aliase.find(y => y.toLowerCase() == s.toLowerCase()))
      if (info) {
        const stringAliase = info.aliase.length > 0 ? info.aliase.map((element, index, array) => {
          return index == array.length - 1 ? `${element}.` : `${element}, `
        }).join("") : 'Não Definido'
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setAuthor({ name: ' | 🛠️ Commands: ', iconURL: msg.author.displayAvatarURL() })
          .setDescription(`**Comando:**  \`${info.name}\` \n**Descrição:** \`${info.help}\`\n**Aliase's:**  \`${stringAliase}\``)
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
  
      let ordenados = agruparPor(client.commands, 'type')
  
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
        .setFooter({ text: 'Detalhes do comando , Use help + <comando>.' })
      return msg.channel.send({ embeds: [helpMsg] })
  
    } catch (e) { msg.channel.send(`\`${e}\``) }
  
  }
}


