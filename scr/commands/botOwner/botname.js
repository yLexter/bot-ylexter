module.exports = {
    name: "botname",
    help: "Altera o nome do bot.",
    type: 'ownerBot',
    aliase: [],
    execute: async (client, msg, args, cor) => {

        try {
            const newName = args.join(' ')
            const maxLengthName = 20

            if (!newName) { return message.reply('Diga o novo nome do bot.') }
            if (newName.length > maxLengthName || newName.length < 3) { return message.reply(`Meu novo nome deve ter no minímo 3 e ${maxLengthName} caracteres`) }
          
            await client.user.setUsername(`${newName}`)
            msg.reply(`Sucesso! O meu novo nome é \`${newName}\` `)

        } catch (e) { msg.channel.send(`\`${e}\``) }
    }
};