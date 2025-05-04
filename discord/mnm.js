module.exports = {
	help: `Mix 'n Mega command for Discord.`,
	guildOnly: ['713967096949768213', '747809518741618788', '652694230732636173', '887887985629073459'],
	commandFunction: function (args, message, Bot) {
		let [mon, stone] = args.join('').split('@');
		mon = toID(mon);
		stone = toID(stone);
		if (!data.pokedex[mon]) return message.channel.send('Unrecognized Pokemon.');
		const item = data.items[stone];
		if (!item || !(
			item.megaStone ||
			['Blue Orb', 'Red Orb'].includes(item.name) ||
			item.forcedForme.endsWith('-Origin')
		)) return message.channel.send('Unrecognized stone.');
		const preMegaMon = toID(item.megaEvolves) || toID(item.forcedForme) || toID(item.itemUser[0]);
		const postMegaMon = toID(item.megaStone) || toID(data.pokedex[preMegaMon].otherFormes.find(m => /-(?:Mega|Origin|Primal)$/.test(m)));
		const orStats = Object.assign({}, data.pokedex[mon].baseStats);
		const preStats = Object.assign({}, data.pokedex[preMegaMon].baseStats);
		const postStats = Object.assign({}, data.pokedex[postMegaMon].baseStats);
		const stats = [];
		Object.keys(orStats).forEach(stat => stats.push(orStats[stat] + postStats[stat] - preStats[stat]));
		const types = [[null, null], [null, null], [null, null], []];
		data.pokedex[mon].types.forEach((type, index) => {
			types[0][index] = type;
			types[3].push(type);
		});
		data.pokedex[preMegaMon].types.forEach((type, index) => types[1][index] = type);
		data.pokedex[postMegaMon].types.forEach((type, index) => types[2][index] = type);
		if (types[1].join('|') === types[2].join('|'));
		else if (!types[2][1] && types[1][1]) {
			if (types[0].length > 1) types[3][1] = null;
		} else if (types[2][1] && !types[1][1]) {
			if (!types[3].includes(types[2][1])) types[3][1] = types[2][1];
		} else if (types[2][1] && types[1][1]) {
			if (!types[3].includes(types[2][1])) types[3][1] = types[2][1];
		} else if (!types[2][1] && !types[1][1]) {
			if (!types[3].includes(types[2][0])) types[3][1] = types[2][0];
		}
		// eslint-disable-next-line max-len
		return message.channel.send('```\n' + ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'].map((term, i) => term + ': ' + (stats[i] > 1 ? stats[i] < 255 ? stats[i] : 255 : 1)).join(', ') + `\nAbility: ${data.pokedex[postMegaMon].abilities['0']}\nTyping: ${types[3].filter(type => type).join(' / ')}\n` + '```');
	}
};
