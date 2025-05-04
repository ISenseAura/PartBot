if (global.Bot) throw new Error(`This script should not be called from the bot.`);

global.axios = require('axios');
global.Bot = { log: console.log };
global.data = {};
global.fs = require('fs-extra');
global.toID = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');

const hotpatch = require('./data/hotpatch.js');

Promise.all(['pokedex', 'moves', 'unite', 'customcolours'].map(patch => hotpatch(patch, 'Init'))).then(() => {
	console.log(`Done!`);
}).catch(err => {
	console.log(err);
	process.exit();
});
