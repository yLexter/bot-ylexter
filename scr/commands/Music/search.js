
module.exports = {
    name: "search",
    help: "Procura uma música da queue",
    type: 'music',
    aliase: ["sch"],
    execute: async (client, msg, args, cor) => {
        
        const { MessageEmbed } = require("discord.js");
        const { stopMusic } = client.music

        try {

            const queue = client.queues.get(msg.guild.id);

            const formatar = (string) => {
                return string
                    .replaceAll(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]+/g, '')
                    .toLowerCase()
            }

            let s = formatar(args.join(" "))
            var string = ''
            let resultado10 = []
            if (!queue) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setTitle('**Erro:**')
                    .setAuthor({ name: `| ❌ Erro: `, iconURL: msg.author.displayAvatarURL() })
                    .setDescription('Não existe músicas sendo tocada.')
                return msg.channel.send({ embeds: [helpMsg] })
            }

            let titulos = queue.songs.map((element, index) => {
                let titulo_formated = formatar(element.title)
                let musica = queue.songs[index]
                if (titulo_formated.includes(s)) resultado10.push(`**${index}**. [${musica.title}](${musica.url}) [${musica.durationFormatted}]`)
            });
            for (i = 0; i < resultado10.length; i++) {
                string += `${resultado10[i]}\n`
                if (i == 16) break;
            }

            if (resultado10.length == 0) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ❌ No Result Found.`, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            } else {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setDescription(string)
                    .setAuthor({ name: `| 🔎 Possíveis Resultados `, iconURL: msg.author.displayAvatarURL() })
                return msg.channel.send({ embeds: [helpMsg] })
            }

        } catch (e) { stopMusic(client, msg, cor), msg.channel.send(`\`${e}\``) }
    }
};



