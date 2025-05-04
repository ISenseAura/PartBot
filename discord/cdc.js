module.exports = {
	help: `CDC Placement schedule checker`,
	pm: true,
	commandFunction: function (args, message, Bot) {
		if (Bot.sentCDCmessage && Date.now() - Bot.sentCDCmessage < 5 * 60_000) {
			return message.channel.send('Hi sorry this was used recently; it has a 5-minute cooldown');
		}
		(async () => {
			const waiting = await message.channel.send('On it; gimme a min...');
			Bot.sentCDCmessage = Date.now();
			const getData = require('../../cdc-reader/src/index.js');
			const schedules = await getData();
			waiting.delete();
			schedules.forEach(schedule => {
				let msg = '```\n';
				msg += schedule.company;
				msg += '\n\n';
				msg += schedule.post;
				msg += '\n```';
				message.channel.send(msg);
			});
		})();
	}
};
