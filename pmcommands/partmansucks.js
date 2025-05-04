module.exports = {
	noDisplay: true,
	help: `Restarts le Discord side`,
	permissions: 'none',
	commandFunction: function (Bot, by, args, client) {
		if (!['aqrator', 'level51', 'lovemathboy', 'moo'].includes(toID(by))) return Bot.pm(by, `Nou`);
		client.login(config.token);
		Bot.pm(by, 'Can confirm');
	}
};
