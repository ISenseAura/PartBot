const dicts = {
	'csw19': require('./csw19.json'),
	'csw21': require('./csw21.json')
};

const mods = {
	clabbers: {
		aliases: ['anagrams', 'anagram', 'nagaram'],
		check: word => require('./clabbers.json')[word.split('').sort().join('')],
		sourceFile: 'clabbers'
	},
	crazymons: {
		aliases: ['oldpoke', 'oldmons', 'oldpokemon', 'oldpokemod', 'crazy', 'crazypokemon'],
		check: (word, isNormalWord) => {
			const isPokeword = mods.pokemon.check(word, false);
			if (isPokeword) return [5, 0];
			else if (isNormalWord) return [1, 0];
			else return false;
		}
	},
	craxymons: {
		aliases: [],
		check(word, isNormalWord) {
				return mods.crazymons.check(word, isNormalWord);
		},
		letters: {
			A: 10,
			B: 2,
			C: 2,
			D: 2,
			E: 11,
			F: 2,
			G: 2,
			H: 2,
			I: 9,
			J: 1,
			K: 2,
			L: 7,
			M: 4,
			N: 4,
			O: 7,
			P: 2,
			Q: 1,
			R: 5,
			S: 6,
			T: 5,
			U: 5,
			V: 1,
			W: 2,
			X: 1,
			Y: 2,
			Z: 1,
			' ': 2,
		},
		points: {
			A: 1,
			B: 4,
			C: 3,
			D: 3,
			E: 1,
			F: 4,
			G: 3,
			H: 3,
			I: 1,
			J: 12,
			K: 3,
			L: 1,
			M: 2,
			N: 2,
			O: 1,
			P: 4,
			Q: 12,
			R: 1,
			S: 1,
			T: 1,
			U: 1,
			V: 10,
			W: 4,
			X: 5,
			Y: 4,
			Z: 8,
			' ': 0
		},
	},
	pokemon: {
		aliases: ['mon', 'mons', 'poke', 'pokemod', 'pokewords'],
		check: (word, isNormalWord) => {
			const bonus = [2, 10];
			if (data.moves.hasOwnProperty(word)) return bonus;
			if (data.pokedex.hasOwnProperty(word) && !data.pokedex[word].forme) return bonus;
			if (data.abilities.find(a => toID(a) === word)) return bonus;
			if (data.items.hasOwnProperty(word)) return bonus;
			if (isNormalWord) return 1;
			return false;
		}
	}
};

module.exports = {
	dicts,
	mods,
	checkWord: function (word, dict = 'csw21', mod) {
		dict = toID(dict) || 'csw21';
		word = toID(word);
		mod = toID(mod);
		mod = mods.hasOwnProperty(mod) ? mod : Object.keys(mods).find(m => mods[m].aliases.includes(mod));
		if (!dicts.hasOwnProperty(dict)) return null;
		const isNormalWord = dicts[dict][word];
		if (mod && this.mods[mod]) return this.mods[mod].check(word, isNormalWord);
		else return isNormalWord;
	},
	isDict: dict => dicts.hasOwnProperty(toID(dict))
};


