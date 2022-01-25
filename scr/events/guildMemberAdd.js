module.exports = {
    name: 'guildMemberAdd',
    once: false,
    execute: async (client , member) => {

  function meuServer() {
    const idServer = client.guilds.cache.get('905577677635870813')
    const role = member.guild.roles.cache.find((r) => r.name === "Noxiano");
    member.roles.add(role);
    const canalBv = client.channels.cache.get('905595624177664111')

    const msgBoasvindas = new MessageEmbed()
      .setColor(cor)
      .setTitle('Boas vindas , Noxiano! ')
      .setDescription(`Boas Vindas <@${member.user.username}> ao nosso servidor **${idServer}** , não existe regras só não seja um vascaino`)
      .setAuthor(`| ${member.user.tag} `, `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`)
      .setThumbnail('https://c.tenor.com/reGpgpuHKkAAAAAS/doggodance-dance-darius.gif')
    canalBv.send(msgBoasvindas)
  }   

    
 }
}