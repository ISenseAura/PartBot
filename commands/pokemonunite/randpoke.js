module.exports = {
	help: `Randpoke for Unite`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client) {
		Bot.say(room, data.unitedex.random().name + '!');
	}
};
