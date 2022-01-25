const { MessageEmbed } = require("discord.js");

const execute = async (client, msg, args, cor) => {

  try {

    var stringOutros = stringMusica = stringAdm = stringAliase = ``
    var contador_msc = contador_otrs = contador_adm = 0

    const { dados , modelo} = await client.db.fecthGuild(client, msg)
    const customPrefix = dados.prefix || prefix
    const s = args.join(" ")
    const info = client.commands.find(y => y.name == s.toLowerCase()) || client.commands.find(x => x.aliase.find(y => y.toLowerCase() == s.toLowerCase()))

    if (info) {
      const helpMsg = new MessageEmbed()
        .setColor(cor)
        .setAuthor({name: ' | 🛠️ Commands: ', iconURL: msg.author.displayAvatarURL()})
        .addFields({ name: `${customPrefix}${info.name}`, value: `\`${info.help}\``, inline: true })

      if (info.aliase.length > 0) {
        info.aliase.forEach((element, index, array) => {
          index == array.length - 1 ? stringAliase += `${element}` : stringAliase += `${element}, `
        })
        helpMsg.addFields({ name: 'Aliase(s)', value: `\`${stringAliase}\`` })
      }
      return msg.channel.send({ embeds: [helpMsg] })
    }

    client.commands.map((command, index) => {
      typesCommands = {
        music: (linha = "") => {
          stringMusica += `\`${customPrefix}${command.name}\`,  ` + `${linha}`;
          contador_msc++
        },
        others: (linha = "") => {
          stringOutros += `\`${customPrefix}${command.name}\`,  ` + `${linha}`;
          contador_otrs++
        },
        admin: (linha = "") => {
          stringAdm += `\`${customPrefix}${command.name}\`,  ` + `${linha}`;
          contador_adm++
        },
        config: {
          music: contador_msc,
          others: contador_otrs,
          admin: contador_adm
        }
      }
      let { config } = typesCommands
      config[command.type] % 4 == 0 ? typesCommands[command.type]("\n") : typesCommands[command.type]()

    });

    const helpMsg = new MessageEmbed()
      .setColor(cor)
      .setAuthor({name: ' | 🛠️ Commands: ', iconURL: msg.author.displayAvatarURL()})
      .addFields(
        { name: `**Música[${contador_msc}]**\n`, value: `${stringMusica}\n` },
        { name: `**Outros[${contador_otrs}]**\n`, value: `${stringOutros}\n` },
        { name: `**Admin[${contador_adm}]**\n`, value: `${stringAdm}\n` },
        { name: "**Info:**", value: "Use Help + Comando para ver a descrição e os aliases." }
      )
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





/*

const { MessageEmbed } = require("discord.js");
const execute = (client, msg, args , cor) => {

try {

 } catch (e) {
    console.log(e)
   const helpMsg100 = new MessageEmbed()
   .setColor(cor)
   .setTitle(`**Erro** -  Desconhecido #404`)
   .setAuthor(`| ${msg.author.username}` , `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`)
   msg.channel.send(helpMsg100)
 }


}

module.exports = {

   name: "nome do comando",
   help: "descrição",
   type: tipo comando
   execute,

    };

{
      "prefix": "+",
      "id": "905577677635870813",
      "searchyt": [],
      "cMusica": "916129919111680040",
      "autorSY": ""
    }


 */


