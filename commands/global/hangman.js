module.exports = {
	cooldown: 1000,
	help: `Creates a Hangman with the specified arguments.`,
	permissions: 'beta',
	commandFunction: function (Bot, room, time, by, args, client) {
		if (args[1]) return Bot.say(room, unxa);
		if (room === 'pokemongo') {
			const pick = Object.values(data.go.pokedex).filter(mon => !mon.unreleased).random();
			Bot.say(room, `/hangman create ${pick.name}, Pokémon`);
			return;
		}
		let hint = 'Generation: ';
		if (args[0]) {
			const arg = args[0].toLowerCase();
			if (arg === 'generation' || arg === 'gen' || arg === 'g');
			else if (arg === 'colour' || arg === 'color' || arg === 'c') hint = 'Colour: ';
			else if (arg === 'type' || arg === 'types' || arg === 't') hint = 'Type(s): ';
			else if (arg === 'bst' || arg === 'b') hint = 'BST: ';
			else if (arg === 'stat' || arg === 's') hint = ['HP: ', 'Atk: ', 'Def: ', 'SpA: ', 'SpD: ', 'Spe: '].random();
			else if (arg === 'egg') hint = 'Egg group(s): ';
			else if (arg === 'none' || arg === 'n') hint = 'A Pokemon!';
			else if (arg === 'cap') hint = 'CAP! :D';
			else if (arg === 'everything' || arg === 'e') hint = 'Pokémon/Move/Ability/Item!';
			else return Bot.say(room, 'Unable to find requested hint.');
		}
		const pokedex = data.pokedex;
		const filDex = Object.keys(pokedex).filter(m => {
			if (hint === 'CAP! :D') return pokedex[m].isNonstandard === 'CAP';
			return !pokedex[m].forme && pokedex[m].num > 0;
		});
		let sol;
		const mon = pokedex[filDex.random()];
		sol = mon.name;
		let hintData = '';
		const randPokeNum = mon.num;
		if (randPokeNum >= 1 && randPokeNum <= 151) hintData = '1';
		if (randPokeNum >= 152 && randPokeNum <= 251) hintData = '2';
		if (randPokeNum >= 252 && randPokeNum <= 386) hintData = '3';
		if (randPokeNum >= 387 && randPokeNum <= 493) hintData = '4';
		if (randPokeNum >= 494 && randPokeNum <= 649) hintData = '5';
		if (randPokeNum >= 650 && randPokeNum <= 721) hintData = '6';
		if (randPokeNum >= 722 && randPokeNum <= 809) hintData = '7';
		if (randPokeNum >= 810 && randPokeNum <= 905) hintData = '8';
		if (randPokeNum >= 906) hintData = '9';
		// if (randPokeNum < 0) hintData = 'CAP';
		if (hint === 'Colour: ') hintData = mon.color;
		else if (hint === 'Type(s): ') hintData = mon.types.join(' / ');
		else if (hint === 'BST: ') hintData = Object.values(mon.baseStats).reduce((a, b) => a + b, 0);
		else if (hint === 'Egg group(s): ') hintData = mon.eggGroups.join(' and ');
		else if (['HP: ', 'Atk: ', 'Def: ', 'SpA: ', 'SpD: ', 'Spe: '].includes(hint)) {
			if (hint === 'HP: ') hintData = mon.baseStats.hp;
			else if (hint === 'Atk: ') hintData = mon.baseStats.atk;
			else if (hint === 'Def: ') hintData = mon.baseStats.def;
			else if (hint === 'SpA: ') hintData = mon.baseStats.spa;
			else if (hint === 'SpD: ') hintData = mon.baseStats.spd;
			else if (hint === 'Spe: ') hintData = mon.baseStats.spe;
			else return Bot.say(room, 'Error occurred.');
		} else if (hint === 'A Pokemon!') hintData = '';
		else if (hint === 'Pokémon/Move/Ability/Item!') {
			hintData = '';
			sol = [
				filDex.map(mon => pokedex[mon].name),
				Object.values(data.moves)
					.filter(move => move.num > 0 && !move.isZ && !move.isMax && move.isNonstandard !== 'LGPE' && move.isNonstandard !== 'CAP')
					.map(move => move.name),
				data.abilities,
				Object.values(data.items).map(item => item.name)
			].flat().random();
		}
		Bot.say(room, '/hangman create ' + sol + ', ' + hint + (hintData || ''));
	}
};
