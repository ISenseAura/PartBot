module.exports = {
	help: `Ports two terms together. Syntax: ${prefix}fuse (term 1), (term 2)`,
	permissions: 'coder',
	commandFunction: function (Bot, by, args, client) {
		let terms = args.join('').split(',');
		const startTime = Date.now();
		if (terms.length !== 2) return Bot.pm(by, unxa);
		const toWord = {};
		toWord[toID(terms[1])] = terms[1];
		terms = terms.map(term => toID(term));
		Object.values(data.pokedex).filter(mon => !mon.forme).forEach(term => toWord[toID(term.name)] = term.name);
		// TODO: Re-enable
		// Object.values(data.moves).forEach(term => toWord[toID(term.name)] = term.name);
		// Object.values(data.items).map(term => {
		// 	return term.name.endsWith(' Berry') ? term.name.substr(0, term.name.length - 6) : term.name;
		// }).forEach(term => toWord[toID(term)] = term);
		// data.abilities.forEach(term => toWord[toID(term)] = term);
		const words = Object.keys(toWord), first = terms[0], second = terms[1], neighbors = (word) => tools.getPorts(word, words)[1];
		const wordTime = Date.now();
		const preCheck = tools.getPorts(second, words)[0];
		let flag = false, iteration = 1;
		if (preCheck.length === 1) return Bot.pm(by, 'None found. :(');
		const fObj = {};
		let iter = new Set([first]);
		fObj[first] = null;
		while (true) {
			if (iteration > 4) return Bot.pm(by, 'Overloaded!');
			if (!iter.size) return Bot.pm(by, 'None found. :(');
			const iterate = Array.from(iter);
			iter = new Set();
			for (const term of iterate) {
				const runs = neighbors(term);
				for (const run of runs) {
					if (run === term) continue;
					if (!fObj[run]) fObj[run] = term;
					if (run === second) {
						flag = true;
						break;
					}
					iter.add(run);
				}
				if (flag) break;
			}
			if (flag) break;
			iteration++;
		}
		let path = [], at = second;
		while (at) {
			path.unshift(at);
			at = fObj[at];
		}
		path = path.map(term => {
			if (toWord[term]) return toWord[term];
			return tools.toName(term);
		});
		Bot.pm(by, path.join(', '));
		Bot.pm(by, 'Runtime: ' + tools.toHumanTime(Date.now() - wordTime));
	}
};
