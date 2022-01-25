module.exports = {
  name: "say",
  help: "Cores: [ red , yellow ,  green , blue , orange , black , darkblue ] |  Use: say + cor + mensagem , para digitar colorido.",
  type: "others",
  aliase: [],
  execute: (client, msg, args, cor) => {

    const { MessageEmbed } = require('discord.js')

    try {

      var msg_user = args.join(" ")
      var corMsg = args[0].toLowerCase()
      var Msg_args = args.slice(1).join(' ')
      msg.delete().catch(() => { })

      if (msg_user.length > 100 || !msg_user) return msg.reply('Você não digitou **nada** ou o **limite** de caracteres foi excedido!');

      const selectCor = {
        red: '```Diff\n' + `- ${Msg_args}\n` + '```',
        yellow: '```Fix\n' + `${Msg_args}\n` + '```',
        green: '```Diff\n' + `+ ${Msg_args}\n` + '```',
        blue: '```Bash\n' + `"${Msg_args}"` + '```',
        orange: '```CSS\n' + `[${Msg_args}]` + '```',
        black: '```py\n' + `# ${Msg_args}` + '```',
        darkblue: '```md\n' + `# ${Msg_args}` + '```',
      }

      let msg_final = selectCor[corMsg]
      msg_final && Msg_args ? msg.channel.send(msg_final) : msg.channel.send(`\`${msg_user}\``)

    } catch (e) { msg.channel.send(`\`${e}\``) };

 } // Execute end;
}


