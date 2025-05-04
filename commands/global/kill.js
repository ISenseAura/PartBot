module.exports = {
	cooldown: 0,
	help: `Exits the process.`,
	permissions: 'alpha',
	commandFunction: function (Bot, room, time, by, args, client) {
		if (!tools.hasPermission(by, 'admin')) {
			const BoardGames = Bot.rooms.boardgames;
			const byId = toID(by);
			if (!BoardGames?.users.some(u => u.startsWith('#') && toID(u) === byId)) return Bot.roomReply(room, by, 'Access denied');
		}
		Bot.say(room, ':<');
		process.exit();
	}
};
