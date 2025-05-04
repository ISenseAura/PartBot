/* eslint-disable max-len */
/* eslint-disable no-unreachable */

function unitConverter(message) {
	const finals = [];
	// Temperature check
	const rgx = /(?=-|\b)(?:(-?\d{1,5}(?:[.,]?\d{1,5})?)) *(?:°|deg(?:rees?)?)? *([CF])(?=\b|elcius|ah?renheit)/gi;
	const matches = Array.from(message.matchAll(rgx));
	matches.forEach(match => {
		const [_val, _unit] = match.slice(1);
		const val = Number((_val || '0').replaceAll(',', '.')) || 0;
		const unit = _unit?.toUpperCase() === 'C' ? 'C' : 'F';
		let resVal, otherUnit;
		switch (unit) {
			case 'C': {
				resVal = val * 9 / 5 + 32;
				otherUnit = 'F';
				break;
			}
			case 'F': {
				resVal = (val - 32) * 5 / 9;
				otherUnit = 'C';
				break;
			}
		}
		finals.push({
			val: tools.escapeHTML(`${match[0]} = ${Math.round(resVal * 100) / 100} °${otherUnit}`),
			index: match.index,
		});
	});
	// Other stuff
	const rgxs = [
		{
			regex:
				/\b(?:(?:(\d{1,5}(?:[\.,]\d{1,5})?)(?: ?f(?:eet|oot|t)|'))(?:(?:(?: and| &|,)?) ?((?:\d{1,5}(?:[\.,]\d{1,5})?))(?: ?in(?:che?)?(?:s)?|"|))?|((?:\d{1,5}(?:[\.,]\d{1,5})?))(?: ?in(?:che?)?(?:s)?|"))(?:\b| |$)/gi,
			type: ["ft", "in", "in"],
			si: "IMP",
			unit: "L",
		},
		{
			regex: /\b(\d{1,5}(?:[\.,]\d{1,5})?) ?mi(?:les?)?\b/gi,
			type: ["mi"],
			si: "IMP",
			unit: "l",
		},
		{
			regex: /\b(\d{1,5}(?:[\.,]\d{1,5})?) ?k(?:ilo)?m(?:et(?:er|re))?s?\b/gi,
			type: ["km"],
			si: "SI",
			unit: "l",
		},
		{
			regex: /\b(\d{1,5}(?:[\.,]\d{1,5})?) ?m(?:et(?:er|re)s?)?\b/gi,
			type: ["m"],
			si: "SI",
			unit: "L",
		},
		{
			regex: /\b(\d{1,5}(?:[\.,]\d{1,5})?) ?c(?:enti)?m(?:et(?:er|re))?s?\b/gi,
			type: ["cm"],
			si: "SI",
			unit: "L",
		},
		{
			regex: /\b(\d{1,5}(?:[\.,]\d{1,5})?) ?(?:lb|pound)s?\b/gi,
			type: ["lb"],
			si: "IMP",
			unit: "M",
		},
		{
			regex: /\b(\d{1,5}(?:[\.,]\d{1,5})?) ?k(?:ilo)?g(?:ram)?s?\b/gi,
			type: ["kg"],
			si: "SI",
			unit: "M",
		},
	];
	rgxs.forEach((rgx) => {
		const matches = Array.from(message.matchAll(rgx.regex));
		if (!matches.length) return;
		const maps = {
			IMP: {
				L: { ft: 30.48, in: 2.54 },
				l: { mi: 1.609 },
				M: { lb: 0.4536 },
			},
			SI: {
				L: { m: 39.37, cm: 0.3937 },
				l: { km: 0.621 },
				M: { kg: 2.204 },
			},
		};
		const outs = {
			IMP: [
				[100, "m"],
				[1, "cm"],
			],
			SI: [
				[12, "ft"],
				[1, "in"],
			],
		};
		const mapped = matches.map((match) => {
			return match
				.slice(1)
				.map((num) => Number((num || "0").replaceAll(",", ".")) || 0)
				.reduce((a, b, i) => a + b * maps[rgx.si][rgx.unit][rgx.type[i]], 0);
		});
		if (!mapped.length) return;
		finals.push(
			...mapped.map((num, i) => {
				if (rgx.unit === "l")
					return {
						val: tools.escapeHTML(
							`${matches[i][0]} = ${~~(1000 * num) / 1000} ${
								{ IMP: "km", SI: "mi" }[rgx.si]
							}`
						),
						index: matches[i].index,
					};
				if (rgx.unit === "M")
					return {
						val: tools.escapeHTML(
							`${matches[i][0]} = ${~~(1000 * num) / 1000} ${
								{ IMP: "kg", SI: "lb" }[rgx.si]
							}`
						),
						index: matches[i].index,
					};
				const slice = outs[rgx.si];
				const calced = [];
				while (slice.length > 1) {
					const amt = ~~(num / slice[0][0]);
					num %= slice[0][0];
					if (amt) calced.push(`${amt} ${slice[0][1]}`);
					slice.shift();
				}
				calced.push(`${~~(1000 * num) / 1000} ${slice[0][1]}`);
				return {
					val: tools.escapeHTML(matches[i][0] + " = " + calced.join(", ")),
					index: matches[i].index,
				};
			})
		);
	});
	if (!finals.length) return "";
	return finals
		.sort((a, b) => a.index - b.index)
		.map((term) => `<small>${term.val}</small>`)
		.join(" | ");
}


exports.check = function (message, by, room) {
	const userRank = by.match(/^\W/) || ' ';
	by = by.replace(/^\W/, '');
	message = message.replace(/\[\[\]\]/g, '');
	if (toID(message.slice(0, -1)) === toID(Bot.status.nickName) && message.substr(-1) === '?') return Bot.pm(by, `Hi, I'm ${Bot.status.nickName}! I'm a Bot by ${config.owner}. My prefix is \`\`${prefix}\`\`. For more information, use \`\`${prefix}help\`\`.`);
	if (toID(message) === toID(Bot.status.nickName + 'forhelp')) return Bot.pm(by, '-_-, very funny');

	switch (room) {
		case 'scavengers': {
			if (/^\*\*(?:(?:SHUT UP|FUCK(?: Y?OU?)?)(?: PARTMAN)? ){3,}/.test(message)) Bot.say(room, `/roomban ${by}, No you`);
			if (userRank === ' ' && (message.match(/\*\*[^*]*\*\*/g) || []).reduce((a, b) => a + b, '').length > 40) return client.channels.cache.get('808961324851396608').send(`Suspicious message: \n${by}: ${message}`);
			break;
		}

		case 'redacted': {
			if (!message.match(/^\/(?:uhtml|raw)/)) {
				const convertedUnit = unitConverter(message);
				if (convertedUnit) Bot.say(room, `/adduhtml CONVERSION${Date.now()}, ${convertedUnit}`);
			}
			if (/kicks.*snom/.test(message)) return Bot.say(room, '/me kicks ' + by);
			if (new RegExp(`(?:with|alongside|with.*from|help.*of) ${Bot.status.nickName}$`, 'i').test(message)) break;
			if (toID(message) === 'kden' && toID(by) === 'joltofjustice') return Bot.say(room, 'Kden.');
			// if (toID(by) === 'hydro' && /^(?:|[^\/].* )i(?:'?| a)m .{2,}/i.test(message)) return Bot.pm(by, `Hi, ${message.split(/i(?:'| a)m /i)[1].replace(/[^a-zA-Z0-9]*?$/, '')}! I'm ${Bot.status.nickName}!`);
			break;
			if (/^\/me flee/.test(message)) return Bot.say(room, `/me catches ${by}`);
			if (/^\/me runs/.test(message)) return Bot.say(room, `/me chases ${by} down`);
			if (/^\/me hides/.test(message) && !message.toLowerCase().includes(Bot.status.nickName.toLowerCase())) return Bot.say(room, `/me chains ${by}`);
			if (/^right/.test(message) && toID(by) !== 'partman') break;
			// if (new RegExp(`, ?${Bot.status.nickName}\.?$`, 'i').test(message) && !/\. /.test(message)) return Bot.say(room, message.replace(new RegExp(`, ?${Bot.status.nickName}\.?$`, 'i'), '') + ', ' + by + '.');
			if (new RegExp(`^/me .*${Bot.status.nickName}$`, 'i').test(message) && toID(message).split(toID(Bot.status.nickName)).length === 2) return Bot.say(room, message.replace(new RegExp(`${Bot.status.nickName}`, 'i'), by));
			if (new RegExp(`^${Bot.status.nickName} is a `, 'i').test(message)) return Bot.say(room, 'N-no, you.');
			if (Math.random() < 0.1 && /^(?:|[^\/].* )i(?:'?| a)m .{2,}/i.test(message)) return Bot.say(room, `Hi, ${message.split(/i(?:'| a)m /i)[1].replace(/[^a-zA-Z0-9]*?$/, '')}! I'm ${Bot.status.nickName}!`);
			break;
		}

		case 'boardgames': {
			if (/^\/log \(.*? added a new quote: "/.test(message)) Bot.roomReply(room, by, 'U-umm senpai could you also please add the quote to me using ,q a >///<');
			if (/^\*\*(?:(?:SHUT UP|FUCK(?: Y?OU?)?)(?: PARTMAN)? ){3,}/.test(message)) Bot.say(room, `/roomban ${by}, No you`);
			if ((Math.random() < 0.1 || toID(by) === "mengy") && /^(?:|[^\/].* )i(?:'?| a)m .{2,}/i.test(message)) return Bot.say(room, `Hi, ${message.split(/i(?:'?| a)m /i)[1].replace(/[^a-zA-Z0-9]*?$/, '')}! I'm ${Bot.status.nickName}!`);
			break;
		}

		case 'hplauction': {
			if (/has bought .* for \d+[50]00!/.test(message) && toID(by) === 'scrappie') client.channels.cache.get('855537911566303262').send(message);
			break;
		}

		case 'healthfitness': {
			if (message.match(/^\/(?:uhtml|raw)/)) break;
			const convertedUnit = unitConverter(message);
			if (convertedUnit) Bot.say(room, `/adduhtml CONVERSION${Date.now()}, ${convertedUnit}`);
			break;
		}

		case 'pokemongo': {
			if (/^\/log \(.*? added a new quote: "/.test(message)) Bot.roomReply(room, by, 'U-umm senpai could you also please add the quote to me using ,q a >///<');
			break;
		}

		case 'pokemonunite': {
			if (tools.hasPermission(by, 'alpha', room) && message === ',chess n') return Bot.say(room, `!htmlbox <marquee><h1>YOU WERE WARNED NOT TO DO THIS</h1></marquee>`);
			break;
		}

		case 'trickhouse': {
			if (toID(by) === 'officerjenny') {
				return; // Disabled since we're using `,trick` on Discord instead for now
				const match = message.match(/^\/announce \*\*(.*?)\*\* just completed the \*\*(.*?)\*\* challenge! Congratulations!$/);
				if (match) {
					// Bot.say(room, match.slice(1, 3).join(' | '));
					const [, challenger, challenge] = match;
					const difficulty = Bot.DB('trickhouse').get(toID(challenge));
					const html = `<form data-submitsend="/w ${Bot.status.nickName},${prefix}trickhouse {challenger}, {difficulty}, {replay}">Challenge detected for user <input type="text" value="${challenger}" name="challenger"/> of difficulty <select name="difficulty"><option name="difficulty" value="1"${difficulty === 1 ? 'selected' : ''}>Easy</option><option name="difficulty" value="2"${difficulty === 2 ? 'selected' : ''}>Medium</option><option name="difficulty" value="3"${difficulty === 3 ? 'selected' : ''}>Hard</option></select> (the ${challenge} Challenge). Challenge replay: <input type="text" placeholder="Paste replay link here" name="replay"/><br/><button>Submit!</button></form>`;
					Bot.say(room, `/addrankuhtml %, trickhouse-${toID(challenge)}-${toID(challenger)}-${Date.now()}, ${html}`);
				}
			}
		}
	}
};

