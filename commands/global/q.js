// TODO: Handle TCQ-like cases

module.exports = {
	help: `PartBot's quotes module. Check ${prefix}q help for more details`,
	permissions: "none",
	commandFunction: function (Bot, room, time, by, args, client, isPM, runRoom) {
		const ext = Boolean(runRoom);
		if (!runRoom) runRoom = room;
		const origindb = require('origindb'), allDB = origindb('data/QUOTES');
		const DB = allDB(runRoom);
		let quotes = DB.get('quotes');
		if (!DB.get('quotes')) DB.set('quotes', []);
		quotes = DB.get('quotes');
		const exec = toID(args[0]) || "random";
		if (Bot.rooms[room] && !Bot.rooms[room].rank) return Bot.pm(by, "Lemme get stuff set up, first.");
		const voice = tools.hasPermission(by, 'gamma', room);
		const staff = !ext && tools.hasPermission(by, 'beta', room);
		if (room === 'hindi' && !voice && !isPM) {
			return Bot.roomReply(room, by, `Sorry, isko disable kiya hai; PMs mei \`\`${prefix}q hindi\`\` try kar lo!`);
		}
		function respond (text, html, name) {
			const label = name || 'PARTBOTQUOTES';
			if (isPM) return Bot[html ? 'sendHTML' : 'pm'](by, text);
			if (voice) return html ? Bot.say(room, `/adduhtml ${label}, ${text}`) : Bot.say(room, text);
			return html ? Bot.say(room, `/sendprivateuhtml ${by}, ${label}P, ${text}`) : Bot.roomReply(room, by, text);
		}
		function format (quote) {
			const lines = quote.split('\n');
			let html;
			if (lines.length > 4) {
				const opQ = tools.quoteParse(lines.splice(0, 3).join('\n'), false, true);
				const fted = opQ.replace(/(.*)style="padding:3px 0;">(.*)$/, "$1style=\"padding:3px 0;display:inline-block;\">$2");
				html = `<details class="readmore"><summary>${fted}</summary>`;
				html += `${tools.quoteParse(lines.join('\n'), false, true)}</details>`;
			} else html = tools.quoteParse(quote, false, true);
			return html;
		}
		switch (exec) {
			case 'help': case 'h': {
				// eslint-disable-next-line max-len
				respond(`<ul><li><b>(term / index)</b>: Displays a random quote with the specified search term / at the given index</li><li><b>help [h]</b>: Displays this message</li><li><b>random [r]</b>: Displays a random quote</li><li><b>find [f]</b>: Displays all quotes with the specified search term</li><li><b>last [z]</b>: Displays the most latest quote</li><li><b>list [l]</b>: Displays a list of all quotes</li><li><b>page [g]</b>: Displays a page with all quotes</li><li><b>number [n]</b>: Displays the number of quotes</li><li><b>preview [p]</b>: Displays a preview of the supplied quote</li><li><b>add [a]</b>: Adds a quote. For both -a and -p, \\n works as a new line, and /me syntax can be formatted via <code>[14:20:21] • #PartMan hugs Hydro</code> -> <code>[14:20:21] • #[PartMan] hugs Hydro</code> (wrapping the username in []) (staff-only)</li><li><b>delete [d/v/x]</b>: Deletes a quote at the specified index / with the given search term (staff-only)</li><li><b>room [m]</b>: Runs the command in the context of the given room. For example: <code>${prefix}q room Bot Development | list</code></li></ul>`, true, 'PARTBOTQUOTESHELP');
				break;
			}
			case 'random': case 'r': {
				if (!quotes.length) return respond('No quotes in this room.');
				const quote = quotes.random();
				const formatted = format(quote);
				respond(`<hr>${formatted}<hr>`, true);
				break;
			}
			case 'add': case 'a': {
				if (isPM) return respond(`This is only usable in chatrooms.`);
				if (!staff) return respond('Access denied.');
				args.shift();
				const quote = args.join(' ').replace(/\\n/g, '\n').replace(/\n\s/g, '\n');
				quotes.push(quote);
				DB.set('quotes', quotes);
				respond(`Quote added!`);
				respond(`<hr>${format(quote)}<hr>`, true);
				Bot.log(`${by.substr(1)} added a quote in ${Bot.rooms[runRoom]?.title || runRoom}: \n${quote}`);
				break;
			}
			case 'preview': case 'p': {
				if (!staff) return respond('Access denied.');
				args.shift();
				respond(`<hr>${format(args.join(' ').replace(/\\n/g, '\n').replace(/\n\s/g, '\n'))}<hr>`, true);
				break;
			}
			case 'list': case 'l': {
				if (!quotes.length) return respond('No quotes in this room.');
				if (!voice || isPM) {
					return respond(`You can check out <a href="${websiteLink}/quotes/${room}">the website</a> for quotes!`, true);
				}
				const out = quotes.map((q, i) => `<details open><summary>#${i + 1}</summary>${format(q)}</details>`).join('<hr>');
				// eslint-disable-next-line max-len
				respond(`<hr><details><summary>${Bot.rooms[runRoom]?.title || runRoom} Quotes</summary><hr>${out}</details><hr>`, true);
				break;
			}
			case 'listpage': case 'page': case 'g': case 'lp': case 'lpg': {
				if (!quotes.length) return respond('No quotes in this room.');
				// eslint-disable-next-line max-len
				const msg = `/sendhtmlpage ${by}, ${room}quotes, <div style="margin:10px 18px;"><h1>${Bot.rooms[runRoom]?.title || runRoom} Quotes</h1><br><hr>${quotes.map((q, i) => `#${i + 1}<hr>${tools.quoteParse(q, 0, 1)}<hr>`).join('<br>')}</div><hr>`;
				Bot.say(room, msg);
				break;
			}
			case 'delete': case 'd': case 'remove': case 'v': case 'x': {
				if (isPM) return respond(`This is only usable in chatrooms.`);
				if (!staff) return respond('Access denied.');
				if (!quotes.length) return respond('No quotes in this room.');
				args.shift();
				const search = args.join(' ').toLowerCase();
				const num = ~~toID(search);
				let index;
				if (num > 0) {
					index = num - 1;
					if (num > quotes.length) {
						// eslint-disable-next-line max-len
						const amt = `There ${quotes.length === 1 ? 'is' : 'are'} only ${quotes.length || 'no'} quote${quotes.length === 1 ? '' : 's'} in this room.`;
						return respond(amt);
					}
				} else {
					if (toID(search) === 'last' || toID(search) === 'z') index = quotes.length - 1;
					else {
						const found = quotes.map((q, i) => [q.toLowerCase().includes(search), q, i]).filter(f => f[0]);
						if (found.length === 1) index = found[0][2];
						else return respond(`Found multiple matching quotes! [${found.map(n => n[2] + 1).join(', ')}]`);
					}
				}
				const tbd = quotes[index];
				quotes.splice(index, 1);
				DB.set('quotes', quotes);
				respond(`Deleted quote #${index + 1}`);
				Bot.log(`${by.substr(1)} deleted a quote in ${Bot.rooms[runRoom]?.title || runRoom}: \n${tbd}`);
				break;
			}
			case 'amount': case 'amt': case 'number': case 'num': case 'n': {
				// eslint-disable-next-line max-len
				respond(`There ${quotes.length === 1 ? 'is' : 'are'} ${quotes.length || 'no'} quote${quotes.length === 1 ? '' : 's'} in this room.`);
				break;
			}
			case 'find': case 'f': case 'search': {
				if (!quotes.length) return respond('No quotes in this room.');
				args.shift();
				const search = args.join(' ').toLowerCase();
				if (!search) return respond(`Please mention a term you'd like to search for; terms are not case-sensitive.`);
				const found = quotes.map((q, i) => [q.toLowerCase().includes(search), q, i]).filter(f => f[0]);
				if (!found.length) return respond(`No quotes found.`);
				const out = found.map(([f, q, i]) => `<details open><summary>#${i + 1}</summary>${format(q)}</details>`).join('<hr>');
				respond(`<hr><details><summary>Search Results (${found.length})</summary><hr>${out}</details><hr>`, true);
				break;
			}
			case 'last': case 'latest': case 'z': {
				if (!quotes.length) return respond('No quotes in this room.');
				const quote = quotes[quotes.length - 1];
				const formatted = format(quote);
				respond(`<hr>${formatted}<hr>`, true);
				break;
			}
			case 'room': case 'runroom': case 'rr': case 'm': {
				args.shift();
				const [newRoom, newRun] = args.join(' ').splitFirst('|', 1);
				if (!toID(newRun)) return respond(`What command would you like to run in the ${newRoom} room?`);
				Bot.commandHandler('q', by, newRun.trim().split(' '), room, isPM, tools.getRoom(newRoom));
				break;
			}
			default: {
				if (!quotes.length) return respond('No quotes in this room.');
				const search = args.join(' ').toLowerCase();
				let num = ~~toID(search);
				if (!search) return respond(`Please mention a term/index you'd like to search for; terms are not case-sensitive.`);
				if (num > 0) {
					if (num > quotes.length) {
						// eslint-disable-next-line max-len
						const amt = `There ${quotes.length === 1 ? 'is' : 'are'} only ${quotes.length || 'no'} quote${quotes.length === 1 ? '' : 's'} in this room.`;
						return respond(amt);
					}
					num--;
					const quote = quotes[num];
					const formatted = format(quote);
					respond(`<hr>${formatted}<hr>`, true);
				} else {
					if (search.length === 1) return respond(`Could not find an option with the flag ${search}.`);
					const found = quotes.map((q, i) => [q.toLowerCase().includes(search), q, i]).filter(f => f[0]);
					if (!found.length) return respond(`No quotes found.`);
					const chosen = found.random();
					return respond(`<hr>#${chosen[2] + 1}<br>${format(chosen[1])}<hr>`, true);
				}
			}
		}
	}
};
