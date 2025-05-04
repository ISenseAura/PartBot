module.exports = {
	help: `Piplupede stuff`,
	permissions: 'none',
	noDisplay: true,
	commandFunction: function (Bot, by, args, client) {
		// eslint-disable-next-line max-len
		const html = `<img src="https://cdn.discordapp.com/attachments/773476494105772047/940320905438036038/unknown.png" height="185" width="214">`;
		Bot.say('piplupede', `/sendprivatehtmlbox ${by}, ${html}`);
	}
};
