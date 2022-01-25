module.exports = {
    name: "seek",
    help: "Avança ou retrocede para minutagem desejada , use Horas:Minutos:Segundos",
    type: "music",
    aliase: [],
    execute: async (client, msg, args, cor) => {

        const { MessageEmbed, MessageCollector } = require("discord.js");
        const {
            AudioPlayerStatus,
            StreamType,
            createAudioPlayer,
            createAudioResource,
            joinVoiceChannel,
        } = require('@discordjs/voice');

        const Youtube = require("youtube-sr").default;
        const play = require('play-dl')
        const { textToSeconds } = client.music

        try {

            const queue = client.queues.get(msg.guild.id);

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


            try {
                var secondsFinal = await textToSeconds(args[0])
            } catch (e) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| Informe Corretamente => HH:MM:SS `, iconURL: msg.author.displayAvatarURL() })
                return msgPrincipal.edit({ embeds: [helpMsg] }).catch(e => { })
            }

            const song = queue.songs[0]

            if (secondsFinal >= song.duration / 1000) {
                const helpMsg = new MessageEmbed()
                    .setColor(cor)
                    .setAuthor({ name: `| Valor maior que o da música`, iconURL: msg.author.displayAvatarURL() })
                return msgPrincipal.edit({ embeds: [helpMsg] }).catch(e => { })
            }

            const stream = await play.stream(song.id, { seek: secondsFinal, quality: 3 })
            const resource = await createAudioResource(stream.stream, { inputType: StreamType.Opus });
            queue.dispatcher.play(resource);
            queue.connection.subscribe(queue.dispatcher)

        } catch (e) {
            console.log(e)
            const helpMsg = new MessageEmbed()
                .setColor(cor)
                .setAuthor({ name: `| ${e} `, iconURL: msg.author.displayAvatarURL() })
            msgPrincipal.edit({ embeds: [helpMsg] }).catch(e => { })
        }


    }
};