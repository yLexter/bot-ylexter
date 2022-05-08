const time = new Set()

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    execute: async (client, oldState, newState) => {

        const guild = newState.guild
        const channelBot = guild.me.voice.channel
        const timeToBack = 60

        if (!channelBot) return;
        if (oldState.id == client.user.id && oldState.channelId != newState.channelId) return verifyBotAlone();
        if (newState.channelId == channelBot.id) time.delete(guild.id);
        if ((oldState.channelId != channelBot.id) && (!oldState.channelId && newState.channelId)) return;

        verifyBotAlone()

        function verifyBotAlone() {
            const allMembers = [...channelBot.members.values()].filter(x => x.user.id == client.user.id || !x.user.bot)
            if (allMembers.length != 1 && allMembers.find(x => x.id == client.user.id)) return;
            time.add(guild.id)
            setTimeout(() => {
                if (time.has(guild.id)) {
                    const queue = client.queues.get(guild.id)
                    queue?.connection?.destroy();
                    queue?.message?.delete()?.catch(() => { })
                    queue?.collector?.stop()
                    client.queues.delete(guild.id)
                }
            }, timeToBack * 1000)
        }


    }
}

