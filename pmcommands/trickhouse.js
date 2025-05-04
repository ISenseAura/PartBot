module.exports = {
	help: `Syntax: ${prefix}trickhouse (challenger), (difficulty - 1/2/3), (replay / post-match Elo)`,
	permissions: 'none',
	commandFunction: async function (Bot, by, args, client) {
		const userID = toID(by);
		if (
			!tools.hasPermission(by, 'trickhouse', 'beta') ||
			Bot.rooms.trickhouse?.users.find(u => toID(u) === userID)?.startsWith(' ')
		) return Bot.pm(by, `Access denied.`);
		const cargs = args.join(' ').split(',');
		if (cargs.length < 3 || cargs.length > 4) return Bot.pm(by, unxa);
		const challenger = cargs.shift().trim();
		let difficulty = toID(cargs.shift());
		const difficulties = [null, 'easy', 'medium', 'hard'];
		if (difficulties.includes(difficulty)) difficulty = difficulties.indexOf(difficulty);
		difficulty = ~~difficulty;
		if (difficulty > 3 || difficulty <= 0) return Bot.pm(by, `Invalid difficulty.`);
		const replay = cargs.shift().trim();
		let elo;
		if (~~replay) elo = ~~replay;
		else {
			function getRatings (a, won, b) {
				function getKFactor (elo, win) {
					if (elo >= 1600) return 32;
					if (elo >= 1300) return 40;
					if (elo >= 1100) return 50;
					const scale = (1099 - elo) / 99;
					if (win) return 50 + 30 * scale;
					else return 50 - 30 * scale;
				}
				function getExpected (a, b) {
					return 1 / (1 + Math.pow(10, (b - a) / 400));
				}
				const expectedA = getExpected(a, b);
				const expectedB = getExpected(b, a);
				const finalA = Math.round(a + getKFactor(a, won) * (+won - expectedA));
				const finalB = Math.round(b + getKFactor(b, !won) * (+!won - expectedB));
				return [finalA, finalB];
			}

			async function parseLink (url) {
				if (!url.startsWith('https://replay.pokemonshowdown.com/gen')) throw new Error('Link must be a Showdown replay');
				const link = url.endsWith('.log') ? url : url + '.log';
				const res = await axios.get(link);
				const lines = res.data.split('\n');
				const players = {};
				let self, other;
				let rated;
				lines.forEach(line => {
					const args = line.split('|');
					args.shift();
					switch (args[0]) {
						case 'player': {
							const id = toID(args[2]);
							if (!args[4]) break;
							players[id] = {
								name: args[2],
								id,
								elo: ~~args[4],
								pos: args[1]
							};
							break;
						}
						case 'rated': {
							rated = true;
							break;
						}
						case 'win': {
							const win = toID(args[1]);
							const winner = players[win];
							if (!winner) throw new Error(`You suck (couldn't find the winner from the players)`);
							const loser = Object.values(players).find(p => p.id !== win);
							winner.win = true;
							loser.win = false;
							break;
						}
					}
				});
				if (!rated) throw new Error('Battle was unrated');
				const elos = getRatings(winner.elo, true, loser.elo);
				return elos;
			}

			try {
				[elo] = await parseLink(replay, toID(challenger));
			} catch (err) {
				Bot.pm(by, err.message);
				return Bot.log(err);
			}
		}
		const points = Math.round(((elo - 1000) ** 2 / 500 + 300) * difficulty);
		try {
			await tools.addPoints(0, { [challenger]: points }, 'trickhouse', by);
			const Room = Bot.rooms.trickhouse;
			const id = cargs.length ? cargs.shift() : null;
			if (id && Room?.vers?.[id]) {
				const chall = Room.vers[id];
				Bot.say('trickhouse', `/changerankuhtml ${chall.challenge}-${chall.challenger}-${id},Approved`);
				delete Rooms.vers[id];
			}
			const pointsStr = `${points} point${points === 1 ? '' : 's'}`;
			Bot.pm(by, `Awarded ${pointsStr} to ${challenger}.`);
			const msg = `You were awarded ${pointsStr} in Trick House! Use \`\`${prefix}leaderboard trickhouse\`\` to check.`;
			Bot.pm(challenger, msg);
		} catch (e) {
			Bot.log(e);
			Bot.pm(by, `Yo uhh PartMan sucks (${e.message})`);
		}
	}
};
