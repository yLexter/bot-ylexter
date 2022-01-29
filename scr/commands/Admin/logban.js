module.exports = {
  name: "logs",
  help: "Mostra o registro de ban do server , use logban + id para ver logs de determinado user.",
  type: "admin",
  aliase: [],
  execute: async (client, msg, args, cor) => {

    const { MessageEmbed } = require("discord.js");

    try {
      const userId = args[0]
      const {dados , modelo } = await client.db.fecthGuild(client , msg)
      const user = dados.logs.find(x => { return `${msg.guild.id}-${userId}`})
      let string = ''

      if(dados.logs.length == 0) return msg.reply({content: 'Os logs estão vazios'})

      if (user) {
        const { idGuild, nome, id, motivo, autor, data } = user
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setDescription(`**Autor:** ${autor}\n**Member:** ${nome}\n**Id:** ${id}\n**Reason:** ${motivo}\n**Data:** ${data}\n\n`)
          return msg.channel.send({ embeds: [helpMsg] })
        }

        dados.logs.forEach((element, index, array) => {
        const { idGuild, nome, id, motivo, autor, data } = element
        let formated = string = `${index}.\n**Autor:** ${autor}\n**Member:** ${nome}\n**Id:** ${id}\n**Reason:** ${motivo}\n**Data:** ${data}\n`
        if (array.length < 5) {
          string = formated
          return embed(string)
        } else {
          return index % 4 == 0 ? embed(string) : string += formated 
        }
      });

      function embed(string) {
        const helpMsg = new MessageEmbed()
          .setColor(cor)
          .setDescription(string)
          .setAuthor({ name:`| 🛠️ LogBan`, iconURL: msg.author.displayAvatarURL()})
          return msg.channel.send({ embeds: [helpMsg] })
        }
    } catch (e) { msg.channel.send(`\`${e}\``) }
  }

}