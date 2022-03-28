const { logs } = require("../Jsons/config.json")
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'error',
    once: false,
    execute: async (client, e) => {

        const embedError = new MessageEmbed()
            .setColor('RED')
            .setTitle('ERROR - Client Error')
            .setDescription('```Diff\n' + `- ${e}\n` + '```')
        client.channels.cache.get(logs.error).send({ embeds: [embedError] })

    }
}