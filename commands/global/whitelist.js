// TODO: Use a database instead

module.exports = {
	help: `Whitelist! Syntax: ${prefix}whitelist add/remove/list`,
	permissions: 'beta',
	commandFunction: function (Bot, room, time, by, args, client) {
		const auth = Bot.rooms[room].auth?.gamma;
		if (!auth) return Bot.say(room, `The whitelist has not been enabled for this room - please contact my owner.`);
		if (!args.length) args.push('list');
		function updateRoom (gamma) {
			const roomFile = fs.readFileSync(`./data/ROOMS/${room}.json`, 'utf8');
			if (!roomFile) return Bot.log(`Error: Could not find file for room ${room}`);
			const newJSON = roomFile.replace(/(?<=\n\t\t"gamma": \[).*?(?=\]\n)/, gamma.map(u => `"${u}"`).join(', '));
			fs.writeFileSync(`./data/ROOMS/${room}.json`, newJSON);
			Bot.log(`Updated JSON for ${room}`);
			(async () => {
				try {
					const output = require('child_process')
						.execSync('git add data/ROOMS && git commit -m "Update rooms" && git push origin main')
						.toString();
					Bot.log(output);
				} catch (e) {
					Bot.log(e);
				}
			})();
		}
		switch (toID(args.shift())) {
			case 'add': case 'a': {
				const u = toID(args.join(''));
				if (!u || u.length > 19 || auth.includes(u)) return Bot.say(room, `Invalid user to add to whitelist (${u})`);
				auth.push(u);
				auth.sort();
				updateRoom(auth);
				return Bot.say(room, `${u} was added to the whitelist!`);
			}
			case 'remove': case 'delete': case 'r': case 'd': case 'x': {
				const u = toID(args.join(''));
				if (!u || u.length > 19 || !auth.includes(u)) return Bot.say(room, `Invalid user to remove from whitelist (${u})`);
				auth.remove(u);
				updateRoom(auth);
				return Bot.say(room, `${u} was removed from the whitelist.`);
			}
			case 'list': case 'l': case 'all': case 'view': case 'v': {
				const whitelistHtml = tools.listify(auth.map(u => tools.colourize(u)));
				return Bot.say(room, `/adduhtml BOTWHITELIST, The current whitelist is: ${whitelistHtml}`);
			}
			default: return Bot.say(room, 'Unrecognized option');
		}
	}
};
