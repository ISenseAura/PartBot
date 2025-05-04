module.exports = {
	help: `Adds a user to a hosted raid.`,
	permissions: 'none',
	commandFunction: async function (Bot, by, args, client) {
		const id = toID(by);
		(Bot.kuncs ??= {})[id] ??= {};
		let timered = false;
		if (args.length) {
			switch (args[0]) {
				case 'end': case 'cancel': case 'stop': {
					if (!Bot.kuncs[id].kunc && !Bot.kuncs[id].kuncTimer) return Bot.pm(by, 'No kunc found.');
					Bot.kuncs[id].endLastKunc();
					clearTimeout(Bot.kuncs[id].kuncTimer);
					delete Bot.kuncs[id].kuncTimer;
					Bot.pm(by, 'Kunc ended.');
					delete Bot.kuncs[id].kunc;
					return;
				}
				default: {
					const timerVal = tools.fromHumanTime(args.join(' '));
					if (timerVal) {
						if (timerVal > 60_000) return Bot.pm(by, 'Timer may only be up to 60s.');
						timered = true;
						Bot.pm(by, `Kunc will start in: ${tools.toHumanTime(timerVal)}`);
						await new Promise((resolve, reject) => {
							Bot.kuncs[id].kuncTimer = setTimeout(() => resolve(), timerVal);
						});
						delete Bot.kuncs[id].kuncTimer;
					} else return Bot.pm(by, 'Unrecognized argument.');
				}
			}
		}
		if (!timered && Bot.kuncs[id].kuncTimer) return Bot.pm(by, 'Kunc is already scheduled!');
		if (Bot.kuncs[id].kunc) return Bot.pm(by, 'Kunc is already in progress! Use the \'end\' argument to end it.');
		Bot.pm(by, 'test');
		const mons = require('../data/DATA/rands.json');
		const selectedMon = Object.keys(mons).random();
		const selectedMoves = mons[selectedMon].sets.random().movepool.random(4);
		const matchingMons = Object.keys(mons).filter(m => {
			const mon = mons[m];
			return mon.sets.some(set => {
				return selectedMoves.every(move => set.movepool.includes(move));
			});
		});
		const matchingNames = matchingMons.map(mon => data.pokedex[mon].name);
		Bot.pm(by, `**Kunc: ${selectedMoves.join(', ')}**`);
		const ID = Date.now();
		Bot.kuncs[id].kunc = ID;
		const solvers = [];
		function watchForAnswer (mBy, message) {
			if (toID(mBy) !== id) return;
			if (['/', '!'].includes(message.charAt(0))) return;
			const guessMon = toID(message);
			const matchedMon = matchingMons.find(mon => tools.levenshtein(mon, guessMon) <= 1);
			if (matchedMon) {
				if (!solvers.map(toID).includes(toID(mBy))) solvers.push(mBy.substr(1));
				// Set timer for 1s to allow guesses
				if (typeof Bot.kuncs[id].kunc !== 'number') return; // Already scheduled to terminate
				Bot.kuncs[id].kunc = setTimeout(() => {
					Bot.removeListener('pm', watchForAnswer);
					const plural = matchingMons.length === 1 ? ' was' : 's were';
					Bot.pm(by, `The correct answer${plural} ${matchingNames.join(' / ')}! Kunc winner: ${solvers[0]}`);
					if (solvers.length > 1) Bot.pm(by, `Consolation prize: ${tools.listify(solvers.slice(1))}`);
					delete Bot.kuncs[id].kunc;
				}, 1_000);
			} else return;
		}
		Bot.on('pm', watchForAnswer);
		Bot.kuncs[id].endLastKunc = () => {
			Bot.removeListener('pm', watchForAnswer);
		};
		setTimeout(() => {
			if (Bot.kuncs[id].kunc !== ID) return;
			Bot.removeListener('pm', watchForAnswer);
			const plural = matchingMons.length === 1 ? ' was' : 's were';
			Bot.pm(by, `No one managed to answer in time - the correct answer${plural} ${matchingNames.join(' / ')}!`);
			delete Bot.kuncs[id].kunc;
		}, 15_000);
	}
};
