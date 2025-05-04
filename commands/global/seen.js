module.exports = {
	cooldown: 1,
	help: `Displays the time when a user was last seen.`,
	permissions: 'gamma',
	commandFunction: async function (Bot, room, time, by, args, client) {
		const user = toID(args.join(''));
		if (!user) return Bot.pm(by, 'Which user?');
		if (user === toID(Bot.status.nickName)) return Bot.say(room, 'I\'m online. -_-');
		if (user === toID(by)) return Bot.say(room, 'That nerd\'s online.');
		if (Bot.getRooms(user).length) return Bot.say(room, `${args.join(' ').trim()} is online.`);
		const seen = (await DATABASE.lastSeen(user))?.getTime();
		if (!seen) return Bot.say(room, "Sorry, I haven't seen that user online.");
		else return Bot.say(room, `I last saw ${args.join(' ').trim()} around ${tools.toHumanTime(Date.now() - seen)} ago.`);
	}
};
