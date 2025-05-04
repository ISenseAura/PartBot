module.exports = {
	cooldown: 1000,
	help: `Pats a user.`,
	permissions: 'gamma',
	commandFunction: function (Bot, room, time, by, args, client) {
		if (['hydrostatics', 'hydro', 'sanju'].includes(toID(by))) args = [by.substr(1)];
		Bot.say(room, `/me pats ${args.length ? args.join(' ') : by.substr(1)}`);
	}
};
