module.exports = {
	help: `Checks for alts of the given user. Requires you to be roomstaff in one of PartBot's rooms.`,
	permissions: 'none',
	commandFunction: async function (Bot, by, args, client) {
		for (let r in Bot.rooms) {
			r = Bot.rooms[r];
			if (['public', 'hidden'].includes(r.type)) {
				if (tools.hasPermission(by, 'beta', toID(r.title)) || /^[%@*&]/.test(by)) {
					const user = toID(args.join(''));
					if (!user) return Bot.pm(by, `Whose?`);
					const alts = await DATABASE.getAlts(user);
					if (!alts.length) return Bot.pm(by, `${user} has no known alts.`);
					// eslint-disable-next-line max-len
					return Bot.sendHTML(by, `<details><summary>${user}'s alts [${alts.length}]</summary><hr />${alts.sort().join(', ')}</details>`);
				}
			}
		}
		return Bot.pm(by, 'Access denied.');
	}
};
