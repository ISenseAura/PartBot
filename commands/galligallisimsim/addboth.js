module.exports = {
	cooldown: 100,
	help: `Adds both points to users. Syntax: ${prefix}addboth (type), (user1), (user2), (points)`,
	permissions: 'beta',
	commandFunction: function (Bot, room, time, by, args, client) {
		Bot.commandHandler('addpoints', by, args, room, false);
		Bot.commandHandler('addspecial', by, args, room, false);
	}
};
