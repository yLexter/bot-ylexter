const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const Database = require('../../Database/moongose')
const { secondsToText } = require('../../Functions/Utils')

module.exports = {
   name: "customplaylist",
   help: "Maneja sua playlist personalizada",
   type: 'music',
   usage: '<Comando> + Método + <Args> , use <comando> + help para ver todos os métodos',
   cooldown: 5,
   aliase: ["ctp"],
   execute: async (client, msg, args, cor) => {

      try {
         const { songSearch, tocarPlaylist } = client.music
         const userDices = await Database.fecthUser(client, msg)
         const { customPlaylist } = userDices
         const method = args[0]
         const argUser = args?.slice(1).join(" ")
         const objectMethod = {
            'adicionar': ['add', 'adicionar'],
            'tocar': ['play', 'tocar', 'reproduzir'],
            'deletar': ['delete', 'del', 'remove'],
            'ajuda': ['help', 'ajuda'],
            'deletarplaylist': ['delplaylist', 'deletarplaylist', 'delpl'],
            'verCustomPlaylist': ['view', 'ver', 'see']
         }
         const { verCustomPlaylist, adicionar, tocar, deletar, ajuda, deletarplaylist } = objectMethod

         if (!argUser && !(objectMethod.ajuda.concat(tocar, deletarplaylist, verCustomPlaylist)).includes(method)) return msg.reply('Nenhum argumento foi fornecido.');
         if (adicionar.includes(method)) return await addSongs();
         if (tocar.includes(method)) return await playCustomPlaylist();
         if (deletar.includes(method)) return await deleteSong();
         if (ajuda.includes(method)) return help();
         if (deletarplaylist.includes(method)) return await deletePlaylist();
         if (verCustomPlaylist.includes(method)) return await viewPlaylist();

         return msg.reply('**Metodo invalido, para ver todos os métodos use <comando> + help!**')

         async function addSongs() {
            const searchDices = await songSearch(client, msg, argUser)
            const objets = {
               'playlist': async () => {
                  const { songs, playlist } = searchDices
                  await Database.user.findOneAndUpdate(
                     { id: msg.author.id },
                     { customPlaylist: customPlaylist.concat(songs) }
                  )

                  const embed = new MessageEmbed()
                     .setDescription(`**A playlist [${playlist.name}](${playlist.url}) foi adicionado a custom playlist com sucesso!**`)
                     .setColor(cor)
                  return msg.reply({ embeds: [embed] })
               },
               'track': async () => {
                  await Database.user.findOneAndUpdate(
                     { id: msg.author.id },
                     { $push: { customPlaylist: searchDices } }
                  )
                  const embed = new MessageEmbed()
                     .setDescription(`**A track [${searchDices.title}](${searchDices.url}) foi adicionado a ${customPlaylist.length}° posição da custom playlist!**`)
                     .setColor(cor)
                  return msg.reply({ embeds: [embed] })
               }
            }

            return objets[searchDices.type]()
         }

         async function playCustomPlaylist() {
            if (!msg.member.voice.channel) return msg.reply('Você precisa está em um canal de voz primeiro.')
            if (!customPlaylist.length) return msg.reply('Não exite nenhuma música em sua custom playlist.');
            await tocarPlaylist(client, msg, customPlaylist)
         }

         async function deleteSong() {
            if (!customPlaylist.length) return msg.reply('Não exite nenhuma música em sua custom playlist.');
            const findSong = customPlaylist[argUser] || customPlaylist.find(song => {
               return song.title.includes(argUser) ||
                  song.url == argUser ||
                  song.id == argUser
            })

            if (!findSong) return msg.reply('Não encontrei a música que procura , tente novamente.');

            await Database.user.findOneAndUpdate(
               { id: msg.author.id },
               { $pull: { customPlaylist: findSong } }
            )

            const embed = new MessageEmbed()
               .setDescription(`**A track [${findSong.title}](${findSong.url}) foi deletada da custom playlist com sucesso!**`)
               .setColor(cor)
            return msg.reply({ embeds: [embed] })

         }

         function help() {
            const keys = Object.entries(objectMethod)
            const string = keys.map(element => {
               return `${element[0]} - ${element[1].join(", ")}`
            }).join('\n')
            const embed = new MessageEmbed()
               .setColor(cor)
               .setTitle('Todos os métodos do custom playlist')
               .setDescription(`**${string}\n\nAdd: Pesquisa ou URL\nDelete: Posição da Música, URL ou Titulo**`)
            return msg.reply({ embeds: [embed] })
         }

         async function deletePlaylist() {
            if (!customPlaylist.length) return msg.reply('Não exite nenhuma música em sua custom playlist.');
            await Database.user.findOneAndUpdate(
               { id: msg.author.id },
               { customPlaylist: [] }
            )
            return msg.reply('Sua custom playlist foi deletada com sucesso.')
         }

         async function viewPlaylist() {
            if (!customPlaylist.length) return msg.reply('Não exite nenhuma música em sua custom playlist.');

            const row = new MessageActionRow()
               .addComponents(
                  new MessageButton()
                     .setCustomId('ttretroceder')
                     .setEmoji('⏮️')
                     .setStyle('PRIMARY'),
                  new MessageButton()
                     .setCustomId('retroceder')
                     .setEmoji('⏪')
                     .setStyle('PRIMARY'),
                  new MessageButton()
                     .setCustomId('avançar')
                     .setEmoji('⏩')
                     .setStyle('PRIMARY'),
                  new MessageButton()
                     .setCustomId('ttavançar')
                     .setEmoji('⏭️')
                     .setStyle('PRIMARY'),
               );

            let paginaAtual = 1
            let quantidadePerPag = 10
            let pagsTotal = totalPags()
            let durationTotal = totalDuration()
            let msg_principal = await msg.channel.send({ embeds: [msgEmbed(paginaAtual)], components: [row] })

            function queuePags(number) {
               let string = `**0**. [${customPlaylist[0].title}](${customPlaylist[0].url}) [${customPlaylist[0].durationFormatted}]\n`
               const pagAtual = number == 1 ? 1 : number * quantidadePerPag - quantidadePerPag + 1
               for (i = pagAtual; i < pagAtual + quantidadePerPag; i++) {
                  if (!customPlaylist[i]) break;
                  string += `**${i}**. [${customPlaylist[i].title}](${customPlaylist[i].url}) [${customPlaylist[i].durationFormatted}]\n`
               }
               return string
            }

            function mudarMsg(number) {
               return msg_principal.edit({ embeds: [msgEmbed(number)] }).catch(() => { })
            }

            function msgEmbed(number) {
               return new MessageEmbed()
                  .setColor(cor)
                  .setDescription(queuePags(number))
                  .setAuthor({ name: `| 📑 Custom Playlist`, iconURL: msg.author.displayAvatarURL() })
                  .setFooter({ text: `Músicas: ${customPlaylist.length} | Pag's: ${paginaAtual}/${pagsTotal} | Duração: ${durationTotal} ` })
            }

            function totalPags() {
               const total = customPlaylist.length - 1
               return total < quantidadePerPag ? 1 : Math.ceil((total / quantidadePerPag))
            }

            function totalDuration() {
               let string = 0
               for (music of customPlaylist) {
                  string += music.duration
               }
               return secondsToText(string / 1000)
            }

            const collector = await msg_principal.createMessageComponentCollector({
               filter: i => {
                  i.deferUpdate()
                  return i.user.id == msg.author.id
               },
               componentType: 'BUTTON',
               time: 120 * 1000, max: 30
            });

            collector.on('collect', async i => {
               try {
                  const buttons = {
                     'avançar': () => {
                        if (pagsTotal == 1 || paginaAtual == pagsTotal) return;
                        paginaAtual++
                        return mudarMsg(paginaAtual)
                     },
                     'retroceder': () => {
                        if (pagsTotal == 1 || paginaAtual == 1) return;
                        paginaAtual--
                        return mudarMsg(paginaAtual)
                     },
                     'ttavançar': () => {
                        if (paginaAtual == pagsTotal) return;
                        paginaAtual = pagsTotal
                        return mudarMsg(paginaAtual)
                     },
                     'ttretroceder': () => {
                        if (paginaAtual == 1) return
                        paginaAtual = 1
                        return mudarMsg(paginaAtual)
                     },
                  }

                  buttons[i.customId]()

               } catch (e) {
                  return console.log(e)
               }
            })

            collector.on('end', collected => {
               msg_principal.edit({ components: [] }).catch(() => { })
            })

         }


      } catch (e) {
         console.log(e)
         msg.channel.send(`\`${e}\``)
      }
   }


}; 