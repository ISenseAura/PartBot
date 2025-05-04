module.exports = {
	help: `Hotpatches stuff.`,
	permissions: 'beta',
	commandFunction: function (Bot, room, time, by, args, client) {
		Bot.hotpatch('unite', by).then(out => {
			Bot.say(room, `Successfully hotpatched: ${out}.`);
		}).catch(e => Bot.say(room, `Hotpatch failed: ${e}`));
	}
};
