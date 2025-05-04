module.exports = {
	help: `Displays the stats for a specified Mega Stone.`,
	guildOnly: ['713967096949768213', '747809518741618788', '887887985629073459'],
	commandFunction: function (args, message, Bot) {
		const stone = toID(args.join(''));
		const item = data.items[stone];
		if (!item || !(
			item.megaStone ||
			['Blue Orb', 'Red Orb'].includes(item.name) ||
			item.forcedForme.endsWith('-Origin')
		)) return message.channel.send('Unrecognized stone.');
		const preMegaMon = toID(item.megaEvolves) || toID(item.forcedForme) || toID(item.itemUser[0]);
		const postMegaMon = toID(item.megaStone) || toID(data.pokedex[preMegaMon].otherFormes.find(m => /-(?:Mega|Origin|Primal)$/.test(m)));
		const stats = Object.values(data.pokedex[postMegaMon].baseStats).map((t, i) => {
			return t - Object.values(data.pokedex[preMegaMon].baseStats)[i];
		});
		const statStr = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'].map((term, i) => term + ': ' + stats[i]).join(', ');
		return message.channel.send('```' + statStr + '```');
	}
};
