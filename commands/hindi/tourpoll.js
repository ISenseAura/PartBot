module.exports = {
	cooldown: 1000,
	help: `Room ke tour polls. Syntax: \`\`${prefix}tourpoll (time in words / 'hour' / 'start' / 'cancel' / 'status')\`\``,
	permissions: 'beta',
	commandFunction: function (Bot, room, _time, by, args, client) {
		const param = toID(args.join(''));
		if (['end', 'stop', 'start'].includes(param)) {
			if (!Bot.rooms[room].tourpoll) return Bot.say(room, `Koi tour poll chalu nahi hai!`);
			if (!tools.runEarly(Bot.rooms[room].tourpoll.timer)) Bot.say(room, `Error occurred`);
			return;
		}
		if (['cancel', 'delete'].includes(param)) {
			if (!Bot.rooms[room].tourpoll) return Bot.say(room, `Koi tour poll chalu nahi hai!`);
			clearInterval(Bot.rooms[room].tourpoll.timer);
			delete Bot.rooms[room].tourpoll;
			Bot.say(room, `Tour poll cancel hua hai!`);
			return;
		}
		if (['status', 'view', 'current'].includes(param)) {
			if (!Bot.rooms[room].tourpoll) return Bot.say(room, `Koi tour poll chalu nahi hai!`);
			Bot.say(room, `/adduhtml TOURPOLL, ${Bot.rooms[room].tourpoll.html}`);
			const timeLeft = tools.toHumanTime(Bot.rooms[room].tourpoll.timer._endTime - Date.now());
			Bot.say(room, `Tour poll mei ${timeLeft.replace(' and ', ' aur ')} bache hai.`);
			return;
		}
		if (Bot.rooms[room].poll) return Bot.pm(by, `A poll is already in progress!`);
		let time;
		if (['hour', 'onthehour', 'atthehour', 'oth', 'ath'].includes(param)) {
			const date = new Date();
			time = (60 - (30 + date.getMinutes()) % 60) * 60 * 1000;
			time -= date.getSeconds() * 1000;
		} else time = tools.fromHumanTime(param);
		if (!time) return Bot.pm(by, `Invalid time specified!`);
		const DB = require('origindb')('data/TOURS');
		const obj = DB('hindi').object();
		const opts = new Set();
		while (opts.size < 4) opts.add(tools.random(obj));
		Bot.rooms[room].tourpoll = {
			votes: {},
			options: opts
		};
		Bot.rooms[room].tourpoll.timer = setTimeout(async () => {
			const poll = Bot.rooms[room].tourpoll;
			if (!poll) return;
			const OMs = {
				'[Gen 9] Mayhem Random Battle': {
					// eslint-disable-next-line max-len
					code: '[Gen 9] Random Battle @@@ Mayhem, Picked Team Size = 6, Max Team Size = 24',
					// eslint-disable-next-line max-len
					note: 'Iss tour mei bahut saare effects active honge - Scalemons, Inverse, Shared Power, aur Camomons - 24 mei se 6 chunke khelo!'
				},
				'[Gen 8] Shared Power Random Battle': {
					// eslint-disable-next-line max-len
					code: '[Gen 8] Random Battle @@@ Team Preview, Max Teamsize=24, Picked Teamsize=6, [Gen 8] Shared Power',
					// eslint-disable-next-line max-len
					note: 'Iss tour mei Shared Power active hoga, aur aapko 24 Pokemon mei se 6 chunne honge!'
				},
				'[Gen 8] Mayhem Random Battle': {
					// eslint-disable-next-line max-len
					code: '[Gen 8] Random Battle @@@ Team Preview, Max Teamsize=24, Picked Teamsize=6, [Gen 8] Camomons, Scalemons Mod, Inverse Mod',
					// eslint-disable-next-line max-len
					note: 'Iss tour mei bahut saare effects active honge - Scalemons, Inverse, Shared Power, aur Camomons - 24 mei se 6 chunke khelo!'
				}
			};
			/* const cache = {};
			async function altsOf (user) {
				if (cache[user]) return cache[user];
				const alts = await tools.getAlts(user, 0);
				cache[user] = alts;
				return alts;
			}
			const cloned = tools.deepClone(poll.votes);
			const alters = [];
			for (u of Object.keys(cloned)) {
				const alts = await altsOf(u);
				if (alts) for (alt of alts) {
					if (cloned[alt] && alt !== u) {
						// GOTTEM'
						const whitelist = ['abhighostkiller|yash0987'];
						if (whitelist.includes([alt, u].sort().join('|'))) continue;
						alters.push({ alt, u });
						delete poll.votes[alt];
					}
				}
			}
			if (alters.length) {
				const groups = [];
				alters.forEach(({ alt, u }) => {
					const group = groups.find(group => group.has(alt) || group.has(u));
					if (group) {
						group.add(alt);
						group.add(u);
					} else groups.push(new Set([alt, u]));
				});
				const grouped = groups.map(group => [...group].sort()).sort((a, b) => b.length - a.length);
				grouped.forEach(group => {
					Bot.say(room, `/modnote TOURPOLL ALTS: ${tools.listify(group.map(n => `[${n.toUpperCase()}]`))}`);
				});
				*/
			// eslint-disable-next-line max-len
			// 	client.channels.cache.get('901113072226287686').send(`Tourpoll flagged alts: ${grouped.map(group => tools.listify(group.map(n => `[${n.toUpperCase()}]`))).join('\n')}`);
			// }
			const opts = poll.options, votes = {};
			opts.forEach(opt => votes[opt] = 0);
			Object.values(poll.votes).forEach(vote => votes[vote]++);
			const seq = Object.values(votes).sort((a, b) => b - a), max = seq[0];
			let result = Object.keys(votes).filter(vote => votes[vote] === max).random();
			let note = false, oldResult;
			if (OMs[result]) {
				note = OMs[result].note;
				oldResult = result;
				result = OMs[result].code;
			}
			const voteAmt = Object.values(votes).reduce((a, b) => a + b);
			const [res, rules] = result.split('@@@').map(t => t.trim());
			// eslint-disable-next-line max-len
			Bot.say(room, `/adduhtml TOURPOLL, <div class="infobox"><p style="margin: 2px 0 5px 0"><span style="border: 1px solid #6a6; color: #848; border-radius: 4px; padding: 0 3px"><i class="fa fa-bar-chart"></i> Poll khatm</span><strong style="font-size: 11pt"> Aap kaunsa format khelna chahoge?</strong></p>${Object.keys(votes).map(tier => `<div style="margin-top: 14px"><strong>${tier} (${Math.round(votes[tier] * 100 / voteAmt)}%)</strong>${tier === res ? ' ⭐' : ''}</div>`).join('')}</div>`);
			let tourType = 'elimination';
			if (res.endsWith(' 1v1')) tourType = 'elim,, 2';
			Bot.say(room, `/tour create ${res}, ${tourType}`);
			if (oldResult) Bot.say(room, `/tour name ${oldResult}`);
			if (rules) Bot.say(room, `/tour rules ${rules}`);
			if (note) Bot.say(room, `/wall ${note}`);
			Bot.say(room, `/tour forcetimer on`);
			obj[res][0] = 0;
			Object.keys(obj).forEach(tier => {
				if (opts.has(tier)) return;
				if (obj[tier][0] >= 7) return;
				obj[tier][0] += obj[tier][1];
			});
			DB.save();
			delete Bot.rooms[room].tourpoll;
		}, time);
		Bot.rooms[room].tourpoll.timer._endTime = Date.now() + time;
		// eslint-disable-next-line max-len
		Bot.rooms[room].tourpoll.html = `<div class="infobox"><p style="margin: 2px 0 5px 0"><span style="border: 1px solid #6a6; color: #848; border-radius: 4px; padding: 0 3px"><i class="fa fa-bar-chart"></i> Tour Poll</span><strong style="font-size: 11pt"> Aap kaunsa format khelna chahoge?</strong></p>${[...opts].map(tier => `<div style="margin-top: 5px"><button class="button" value="/botmsg ${Bot.status.nickName}, ${prefix}tourpoll vote ${room}, ${tier}" name="send"> <strong>${tier}</strong></button></div>`).join('')}</div>`;
		Bot.say(room, `/adduhtml TOURPOLL,${Bot.rooms[room].tourpoll.html}`);
	}
};
