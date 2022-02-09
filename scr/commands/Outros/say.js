module.exports = {
  name: "say",
  help: "Cores: [ red , yellow ,  green , blue , orange , black , darkblue ] |  Use: say + cor + mensagem , para digitar colorido.",
  type: "others",
  aliase: [],
  execute: (client, msg, args, cor) => {
    try {
      var msg_user = args.join(" ")
      var corMsg = args[0].toLowerCase()
      var Msg_args = args.slice(1).join(' ')
      msg.delete().catch(() => { })

      if (msg_user.length > 100 || !msg_user) return msg.reply('Você não digitou **nada** ou o **limite** de caracteres foi excedido!');

      function msgColorido(corMessage, message = null) {
        const selectCor = {
          red: '```Diff\n' + `- ${message}\n` + '```',
          yellow: '```Fix\n' + `${message}\n` + '```',
          green: '```Diff\n' + `+ ${message}\n` + '```',
          blue: '```Bash\n' + `"${message}"` + '```',
          orange: '```CSS\n' + `[${message}]` + '```',
          black: '```py\n' + `# ${message}` + '```',
          darkblue: '```md\n' + `# ${message}` + '```',
        }
        return selectCor[corMessage] ? selectCor[corMessage] : null
      }

      if (msgColorido(corMsg) && Msg_args) {
        let Formated = `${msg.author.tag}: ${Msg_args}`
        return msg.channel.send(msgColorido(corMsg, Formated))
      } else {
        msg_user = `\`${msg.author.tag}: ${msg_user}\``
        return msg.channel.send(msg_user)
      }

    } catch (e) { msg.channel.send(`\`${e}\``) };

  } // Execute end;
}


