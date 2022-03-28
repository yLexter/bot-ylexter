const { logs } = require("../Jsons/config.json")
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'error',
    once: false,
    execute: async (client, warn) => {

        const embedWarn = new MessageEmbed()
            .setColor('RED')
            .setTitle('WARN - Client WARN')
            .setDescription('```Diff\n' + `- ${warn}\n` + '```')
        client.channels.cache.get(logs.error).send({ embeds: [embedWarn] })

    }
}