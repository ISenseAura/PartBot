module.exports = {
	help: `Start a game of kunc! Use '${prefix}kunc end' to end.`,
	permissions: 'beta',
	commandFunction: async function (Bot, room, time, by, args, client) {
		let timered = false;
		if (args.length) {
			switch (args[0]) {
				case 'end': case 'cancel': case 'stop': {
					if (!Bot.rooms[room].kunc && !Bot.rooms[room].kuncTimer) return Bot.roomReply(room, by, 'No kunc found.');
					Bot.rooms[room].endLastKunc();
					clearTimeout(Bot.rooms[room].kuncTimer);
					delete Bot.rooms[room].kuncTimer;
					Bot.say(room, 'Kunc ended.');
					delete Bot.rooms[room].kunc;
					return;
				}
				default: {
					const timerVal = tools.fromHumanTime(args.join(' '));
					if (timerVal) {
						if (timerVal > 60_000) return Bot.roomReply(room, by, 'Timer may only be up to 60s.');
						timered = true;
						Bot.say(room, `Kunc will start in: ${tools.toHumanTime(timerVal)}`);
						await new Promise((resolve, reject) => {
							Bot.rooms[room].kuncTimer = setTimeout(() => resolve(), timerVal);
						});
						delete Bot.rooms[room].kuncTimer;
					} else return Bot.roomReply(room, by, 'Unrecognized argument.');
				}
			}
		}
		if (!timered && Bot.rooms[room].kuncTimer) return Bot.roomReply(room, by, 'Kunc is already scheduled!');
		if (Bot.rooms[room].kunc) return Bot.roomReply(room, by, 'Kunc is already in progress! Use the \'end\' argument to end it.');
		const mons = require('../../data/DATA/rands.json');
		const selectedMon = Object.keys(mons).random();
		const selectedMoves = mons[selectedMon].sets.random().movepool.random(4);
		const matchingMons = Object.keys(mons).filter(m => {
			const mon = mons[m];
			return mon.sets.some(set => {
				return selectedMoves.every(move => set.movepool.includes(move));
			});
		});
		const matchingNames = matchingMons.map(mon => data.pokedex[mon].name);
		Bot.say(room, `**Kunc: ${selectedMoves.join(', ')}**`);
		const ID = Date.now();
		Bot.rooms[room].kunc = ID;
		const solvers = [];
		function watchForAnswer (mRoom, mTime, mBy, message) {
			if (mRoom !== room) return;
			if (!toID(mBy)) return;
			if (['/', '!'].includes(message.charAt(0))) return;
			const guessMon = toID(message);
			const matchedMon = matchingMons.find(mon => tools.levenshtein(mon, guessMon) <= 1);
			if (matchedMon) {
				if (!solvers.map(toID).includes(toID(mBy))) solvers.push(mBy.substr(1));
				// Set timer for 1s to allow guesses
				if (typeof Bot.rooms[room].kunc !== 'number') return; // Already scheduled to terminate
				Bot.rooms[room].kunc = setTimeout(() => {
					Bot.removeListener('chat', watchForAnswer);
					const plural = matchingMons.length === 1 ? ' was' : 's were';
					Bot.say(room, `The correct answer${plural} ${matchingNames.join(' / ')}! Kunc winner: ${solvers[0]}`);
					if (solvers.length > 1) Bot.say(room, `Consolation prize: ${tools.listify(solvers.slice(1))}`);
					delete Bot.rooms[room].kunc;
				}, 1_000);
			} else return;
		}
		Bot.on('chat', watchForAnswer);
		Bot.rooms[room].endLastKunc = () => {
			Bot.removeListener('chat', watchForAnswer);
		};
		setTimeout(() => {
			if (Bot.rooms[room].kunc !== ID) return;
			Bot.removeListener('chat', watchForAnswer);
			const plural = matchingMons.length === 1 ? ' was' : 's were';
			Bot.say(room, `No one managed to answer in time - the correct answer${plural} ${matchingNames.join(' / ')}!`);
			delete Bot.rooms[room].kunc;
		}, 15_000);
	}
};
