module.exports = {
	cooldown: 1000,
	help: `Displays a shiny sprite.`,
	permissions: 'gamma',
	commandFunction: function (Bot, room, time, by, args, client) {
		const monID = toID(args.join(''));
		if (monID === 'constructor') return Bot.roomReply(room, by, 'You suck');
		const mon = data.pokedex[toID(require('../../data/ALIASES/pokemon.json')[monID]) || monID];
		const base = toID(mon.baseSpecies || mon.name);
		const forme = toID(mon.forme || '') || (monID.startsWith(base) ? monID.substr(base.length) : '');
		const imgLink = `https://play.pokemonshowdown.com/sprites/ani-shiny/${base + (forme ? `-${forme}` : '')}.gif`;
		// eslint-disable-next-line max-len
		Bot.say(room, `/adduhtml ${base},<div style="width:100px;height:100px;background-image:url(${imgLink});background-repeat:no-repeat;background-position:center;background-size:contain"></div>`);
	}
};
