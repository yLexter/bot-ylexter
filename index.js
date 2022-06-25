require('dotenv').config()

const customClient = require('./scr/classes/client')
const client = new customClient();

for (let load of ['commands', 'events']) {
  require(`./scr/structures/${load}`)(client)
}

process.on('unhandledRejection', err => {
  console.log(err);
});






