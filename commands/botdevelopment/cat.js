module.exports = {
	cooldown: 1,
	help: `Form link.`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client) {
		Bot.say(room, `!code ${require('child_process').execSync('cat data/TEMP/ugo.json').toString()}`);
	}
};
