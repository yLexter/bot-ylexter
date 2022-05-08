const { MessageEmbed, MessageCollector } = require("discord.js");
const {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} = require('@discordjs/voice');

const Utils = require("../../Functions/Utils")
const Youtube = require("youtube-sr").default;
const play = require('play-dl')

module.exports = {
    name: "seek",
    help: "Avança ou retrocede para minutagem desejada.",
    type: "music",
    cooldown: 5,
    usage: '<Comando> + <Minutagem> || Ex: seek 1:00',
    aliase: [],
    execute: async (client, msg, args, cor) => {

        try {
            const queue = client.queues.get(msg.guild.id);
            const { seek } = client.music

            if (!queue || !args[0]) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| ❌ Erro `, iconURL: msg.author.displayAvatarURL() })
                    .setDescription('Não existe músicas sendo tocada ou não existe argumentos')
                return msg.channel.send({ embeds: [helpMsg] })
            }

            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| Seeking... `, iconURL: msg.author.displayAvatarURL() })
            var msgPrincipal = await msg.channel.send({ embeds: [helpMsg] })

            const secondsFinal = await Utils.textToSeconds(args[0])
            
            seek(client, msg, secondsFinal)

        } catch (e) {
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ${e} `, iconURL: msg.author.displayAvatarURL() })
            msgPrincipal.edit({ embeds: [helpMsg] }).catch(e => { })
        }


    }
};