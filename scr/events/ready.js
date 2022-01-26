const mongoose = require('mongoose');
// De Darius | ${prefix}Help
module.exports = {
    name: 'ready',
    once: true,
    execute: async (client) => {

    console.log(`o bot ${client.user.username} está online`)
    client.user.setActivity(`Darius Jogando | ${process.env.PREFIX}Help` , {type: 'WATCHING'})

    const connection = mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true })
    .then(() => { console.log('Database Conectada')})
    .catch(e => { console.log(`Erro Ao conectar a database: ${e}`) })
      
    }

}