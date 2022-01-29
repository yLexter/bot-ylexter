const { MessageEmbed } = require("discord.js");

const execute = async (client, msg, args, cor) => {

  try {

    var stringAliase = string = ``
    const s = args.join(" ")
    const info = client.commands.find(y => y.name == s.toLowerCase()) || client.commands.find(x => x.aliase.find(y => y.toLowerCase() == s.toLowerCase()))

    if (info) {
      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setAuthor({ name: ' | 🛠️ Commands: ', iconURL: msg.author.displayAvatarURL() })
        .addFields({ name: `${info.name}`, value: `\`${info.help}\``, inline: true })

      if (info.aliase.length > 0) {
        info.aliase.forEach((element, index, array) => {
          index == array.length - 1 ? stringAliase += `${element}` : stringAliase += `${element}, `
        })
        helpMsg.addFields({ name: 'Aliase(s)', value: `\`${stringAliase}\`` })
      }
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
      let nome = x[0].toUpperCase() + x.slice(1 , x.length) 

      string += `**${nome}[${total}]**\n`

      key.forEach((command, index) => {
        let contador = index + 1
        contador % 4 == 0 ? string += `\`${command.name}\`, \n` : string += `\`${command.name}\`, `
        if (contador == total) string += '\n\n'
      })
    }

    const helpMsg = new MessageEmbed()
      .setColor(cor)
      .setAuthor({ name: ' | 🛠️ Commands: ', iconURL: msg.author.displayAvatarURL() })
      .setDescription(string)
      .addField('Info' , `Para ver a Descrição , Use Help + \`Comando\`.`)
    return msg.channel.send({ embeds: [helpMsg] })

  } catch (e) { msg.channel.send(`\`${e}\``) }

};

module.exports = {
  name: "help",
  help: "Exibe uma lista de todos os comandos",
  type: "others",
  aliase: [],
  execute,
};




