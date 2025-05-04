module.exports = {
	help: `Piplupede stuff`,
	permissions: 'none',
	noDisplay: true,
	commandFunction: function (Bot, by, args, client) {
		// eslint-disable-next-line max-len
		const html = tools.quoteParse(`[15:33:03] @MC PrincessPearl~: It’s the cool kids club\n[15:33:09] @MC PrincessPearl~: Aka friends of swiff all in one gc`);
		Bot.say('piplupede', `/sendprivatehtmlbox ${by}, ${html}`);
	}
};
