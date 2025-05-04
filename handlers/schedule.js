const dayLength = 24 * 60 * 60 * 1000;

function sleep (time) {
	return new Promise((resolve) => setTimeout(resolve, typeof time === 'string' ? tools.fromHumanTime(time) : time));
}

function setSchedule () {
	const schedule = {};

	function everyDay (id, time, days, timezoneOffset, callback) {
		if (schedule[id]) {
			clearTimeout(schedule[id]);
			clearInterval(schedule[id]);
		}
		if (!Array.isArray(days)) {
			const aliases = {
				all: [1, 1, 1, 1, 1, 1, 1],
				weekdays: [0, 1, 1, 1, 1, 1, 0],
				weekends: [1, 0, 0, 0, 0, 0, 1]
			};
			const foundAlias = aliases[days];
			if (foundAlias) days = foundAlias;
		}
		const givenTime = time[0] * 60 * 60 * 1000 + time[1] * 60 * 1000 + time[2] * 1000;
		let originDelta = (givenTime - timezoneOffset * 60 * 60 * 1000 + dayLength) % dayLength;
		const nowGMT = new Date(new Date().toUTCString());
		originDelta = (originDelta + dayLength - nowGMT.getTime() % dayLength) % dayLength;
		schedule[id] = setTimeout(() => {
			const interval = () => {
				const TZ = new Date(new Date(new Date().toUTCString()).getTime() + timezoneOffset * 60 * 60 * 1000);
				const day = TZ.getDay();
				if (days[day]) return callback();
			};
			interval();
			schedule[id] = setInterval(interval, dayLength);
		}, originDelta);
		schedule[id]._timerEnd = Date.now() + originDelta;
	}

	everyDay('dkr', [15, 40,  0], [1, 1, 1, 1, 1, 1, 0], +5.5, () => {
		if (!Bot.rooms.hindi) return;
		// Afternoon randoms
		return Bot.commandHandler('tourpoll', '#PartMan', ['hour'], 'hindi');
	});
	everyDay('dkr_mayhem', [16,  0,  0], [0, 0, 0, 0, 0, 0, 1], +5.5, () => {
		if (!Bot.rooms.hindi) return;
		// Scheduled Mayhem
		Bot.say('hindi', '/tour create [Gen 9] Random Battle, elim');
		Bot.say('hindi', '/tour forcetimer on');
		Bot.say('hindi', '/tour rules Mayhem, Picked Team Size = 6, Max Team Size = 24');
		Bot.say('hindi', `/wall Iss tour mei Camomons, Scalemons, Inverse aur Shared Power clauses enabled hai!`);
	});
	everyDay('rkr', [20, 40,  0], [0, 0, 0, 0, 1, 0, 1], +5.5, () => {
		if (!Bot.rooms.hindi) return;
		// Evening randoms
		return Bot.commandHandler('tourpoll', '#PartMan', ['hour'], 'hindi');
	});
	everyDay('rks', [21,  0,  0], 'all', +5.5, () => {
		if (!Bot.rooms.hindi) return;
		// Evening scheduled
		let tour = [
			'[Gen 9] Mayhem',
			'[Gen 9] Ubers',
			'[Gen 9] OU',
			'[Gen 9] 1v1',
			null,
			'[Gen 9] Monotype',
			null
		][new Date().getDay()];
		if (!tour) return;
		if (Array.isArray(tour)) tour = tour[Math.floor(new Date().getTime() / (7 * dayLength)) % tour.length];
		function tourType (tier) {
			if (tier.includes('1v1')) return 'elim, , 2';
			return 'elim';
		}
		Bot.say('hindi', `/tour create ${tour.includes('Mayhem') ? '[Gen 9] Random Battle' : tour}, ${tourType(tour)}`);
		if (!tour.includes('Mayhem')) Bot.say('hindi', `/tour scouting disallow`);
		Bot.say('hindi', `/tour forcetimer on`);
		if (tour.includes('Mayhem')) {
			Bot.say('hindi', `/tour rules Mayhem, Picked Team Size = 6, Max Team Size = 24`);
			Bot.say('hindi', `/wall Iss tour mei Camomons, Scalemons, Inverse aur Shared Power clauses enabled hai!`);
		}
		return;
	});

	everyDay('hindi-automodchat-enable', [0, 0, 0], 'all', +5.5, () => {
		if (!Bot.rooms.hindi) return;
		Bot.say('hindi', '/automodchat 10, +');
	});
	everyDay('hindi-automodchat-disable', [7, 0, 0], 'all', +5.5, () => {
		if (!Bot.rooms.hindi) return;
		Bot.say('hindi', '/modchat ac');
		Bot.say('hindi', '/automodchat off');
	});

	// everyDay('ggss tourpoll', [12, 0, 0], 'weekends', +5.5, async () => {
	// 	if (!Bot.rooms.galligallisimsim) return;
	// 	// Sunday noon tourpoll
	// 	Bot.say('hindi', '/wall Random tour poll in <<galligallisimsim>>!');
	// 	Bot.say('galligallisimsim', '/modchat ac');
	// 	setTimeout(() => Bot.say('galligallisimsim', '/modchat +'), tools.fromHumanTime('30 min'));
	// 	return Bot.commandHandler('runas', '#PartMan', ['hindi' , '|', 'tourpoll', '10 min'], 'galligallisimsim');
	// });
	everyDay('ggss-tour-schedule', [17, 0, 0], 'all', +5.5, () => {
		if (!Bot.rooms.galligallisimsim) return;
		let tour = [
			'Mons RPS',
			'Same Solo',
			'OHKO Fantasy',
			'Mons RPS',
			'Same Duo',
			'OHKO Fantasy',
			'Same Six'
		][new Date().getDay()];
		if (!tour) return;
		if (Array.isArray(tour)) tour = tour[Math.floor(new Date().getTime() / (7 * dayLength)) % tour.length];
		const rulesForSame = amt => {
			const tiers = [null, '[Gen 9] 1v1', '[Gen 9] 2v2 Doubles', null, null, null, '[Gen 9] National Dex'];
			const baseTier = tiers[amt];
			const randPoke = Object.values(data.pokedex).filter(m => m.num > 0 && !m.forme && !m.evos?.length && m.tier !== 'Illegal').random(amt);
			return `/tour create ${baseTier}, elim\n/tour rules -All Pokemon, ${randPoke.map(m => `+${m.name}`).join(', ')}, Terastal Clause, Z-move Clause, -Hidden Power`;
		};
		const ruleSet = {
			'Mons RPS': '/tour create [Gen 9] Pure Hackmons, elimination\n/tour rules -All Pokemon, +Shedinja, -All Items, -All Moves, -All Abilities, +Upper Hand, +Focus Punch, +Mach Punch, +Choice Band, +Scrappy, Terastal Clause, -No Item, Max Team Size = 1',
			'Same Solo': rulesForSame(1),
			'Same Duo': rulesForSame(2),
			'Same Six': rulesForSame(6),
			'OHKO Fantasy': '/tour create Hackmons Cup, elimination\n/tour rules -All Pokemon, +Medicham-Mega, -All Moves, +Guillotine, +Fissure, +Sheer Cold, +Horn Drill, -Focus Sash, -Air Balloon, -Sturdy, -Pressure, -Wonder Guard, -Focus Band, -No Guard, Terastal Clause, Max Move Count = 1, Max Team Size = 1, Picked Team Size = 1, Adjust Level = 50, Team Preview, Best of = 3'
		};
		const rules = ruleSet[tour];
		if (!rules) return Bot.say('hindi', `/modnote Hi I couldn't start ${tour} because I was missing the rules; report to Part please`);
		Bot.say('galligallisimsim', '/modchat ac');
		Bot.say('galligallisimsim', rules);
		Bot.say('galligallisimsim', `/tour name ${tour}`);
		Bot.say('galligallisimsim', `/tour scouting disallow`);
		Bot.say('galligallisimsim', `/tour forcetimer on`);
		Bot.say('galligallisimsim', `/tour autostart 7`);
		Bot.say('galligallisimsim', `/tour autodq 2`);
		Bot.say('galligallisimsim', '/declare HRMC!');
		Bot.say('hindi', `/wall ${tour} tournament in <<galligallisimsim>>!`);
		return;
	});
	everyDay('ggss-uno', [21, 30, 0], [1, 0, 1, 0, 0, 0, 0], +5.5, async () => {
		if (!Bot.rooms.galligallisimsim) return;
		Bot.say('hindi', '/wall Uno in <<galligallisimsim>>!');
		Bot.say('galligallisimsim', '/modchat ac');
		Bot.say('galligallisimsim', '/declare HRMC!');
		Bot.say('galligallisimsim', 'Uno ek minute mei shuru hoga!');
		Bot.say('galligallisimsim', '/uno create');
		Bot.say('galligallisimsim', '/uno autostart 60');
		await sleep('5 min');
		Bot.say('galligallisimsim', '/modchat +');
	});
	everyDay('ggss-hangman', [21, 30, 0], [0, 1, 0, 0, 1, 0, 0], +5.5, async () => {
		if (!Bot.rooms.galligallisimsim) return;
		Bot.say('hindi', '/wall Hangman in <<galligallisimsim>>!');
		Bot.say('galligallisimsim', '/modchat ac');
		Bot.say('galligallisimsim', '/declare HRMC!');
		const HANGMAN_GAMES_COUNT = 20;
		Bot.say('galligallisimsim', 'Hangman ek minute mei shuru hoga!');
		await sleep('1 min');
		let gamesDone = 0;
		while (gamesDone < HANGMAN_GAMES_COUNT) {
			Bot.commandHandler('hangman', '#PartMan', ['n'], 'galligallisimsim');
			gamesDone++;
			await sleep('20s');
		}
		Bot.say('galligallisimsim', 'Hangman khelne ke liye shukriya!');
		Bot.say('galligallisimsim', '/modchat +');
	});
	everyDay('ggss-kunc', [21, 30, 0], [0, 0, 0, 1, 0, 0, 1], +5.5, async () => {
		if (!Bot.rooms.galligallisimsim) return;
		Bot.say('hindi', '/wall Kunc in <<galligallisimsim>>!');
		Bot.say('galligallisimsim', '/modchat ac');
		Bot.say('galligallisimsim', '/declare HRMC!');
		const KUNC_GAMES_COUNT = 15;
		Bot.say('galligallisimsim', 'Kunc ek minute mei shuru hoga!');
		await sleep('1 min');
		let gamesDone = 0;
		while (gamesDone < KUNC_GAMES_COUNT) {
			Bot.commandHandler('kunc', '#PartMan', [], 'galligallisimsim');
			gamesDone++;
			await sleep('18s');
		}
		Bot.say('galligallisimsim', 'Kunc khelne ke liye shukriya!');
		Bot.say('galligallisimsim', '/modchat +');
	});
	everyDay('ggss-animequiz-9-30', [21, 30, 0], [0, 0, 0, 0, 0, 1, 0], +5.5, async () => {
		if (!Bot.rooms.galligallisimsim) return;
		Bot.say('hindi', '/wall Anime Quiz in <<galligallisimsim>>!');
		Bot.say('galligallisimsim', '/modchat ac');
		Bot.say('galligallisimsim', '/declare HRMC!');
		Bot.say('galligallisimsim', 'Anime Quiz ek minute mei shuru hoga!');
		await sleep('1 min');
		Bot.say('galligallisimsim', ']trivia start 15 -cx ecchi -s 20 -d 5');
	});
	everyDay('ggss-animequiz', [19, 0, 0], [0, 0, 0, 1, 0, 0, 0], +5.5, async () => {
		if (!Bot.rooms.galligallisimsim) return;
		Bot.say('hindi', '/wall Anime Quiz in <<galligallisimsim>>!');
		Bot.say('galligallisimsim', '/modchat ac');
		Bot.say('galligallisimsim', '/declare HRMC!');
		Bot.say('galligallisimsim', 'Anime Quiz ek minute mei shuru hoga!');
		await sleep('1 min');
		Bot.say('galligallisimsim', ']trivia start 15 -cx ecchi -s 20 -d 5');
	});
	everyDay('ggss-saturday-hangman', [19, 0, 0], [0, 0, 0, 0, 0, 0, 1], +5.5, async () => {
		if (!Bot.rooms.galligallisimsim) return;
		Bot.say('hindi', '/wall Hangman in <<galligallisimsim>>!');
		Bot.say('galligallisimsim', '/modchat ac');
		Bot.say('galligallisimsim', '/declare HRMC!');
		const HANGMAN_GAMES_COUNT = 20;
		Bot.say('galligallisimsim', 'Hangman ek minute mei shuru hoga!');
		await sleep('1 min');
		let gamesDone = 0;
		while (gamesDone < HANGMAN_GAMES_COUNT) {
			Bot.commandHandler('hangman', '#PartMan', ['everything'], 'galligallisimsim');
			gamesDone++;
			await sleep('20s');
		}
		Bot.say('galligallisimsim', 'Hangman khelne ke liye shukriya!');
		Bot.say('galligallisimsim', '/modchat +');
	});


	everyDay('xkcd-kgp', [0, 0, 0], [0, 0, 1, 0, 1, 0, 1], +5.5, () => {
		// Tue, Thu, Sat
		const memesChannel = client.channels.cache.get('775774204590686218');
		const command = require('../discord/xkcd.js').commandFunction;
		command(['0'], { channel: memesChannel });
		return;
	});

	// UGOCODE
	/*
	everyDay('ugo-reset-limits', [0, 0, 0], 'all', 0, () => {
		fs.writeFile('./data/TEMP/ugo.json', '{}', err => {
			if (err) Bot.log(err);
			else require('./minorhandler.js').initialize();
		});
	});
	*/
	// ENDUGOCODE

	// everyDay('aoc-reminder', [0, 0, 0], [1, 1, 1, 1, 1, 1, 1], -5, () => {
	// 	return client.channels.cache.get('773859244600459285').send(`Oi <@&1049554883029778483> nerds it's time`);
	// });

	return schedule;
}

module.exports = setSchedule;
