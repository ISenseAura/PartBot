module.exports = {
	cooldown: 10,
	help: `Plop.`,
	permissions: 'gamma',
	commandFunction: function (Bot, room, time, by, args, client) {
		Bot.say(room, `plop`);
	}
};
