/* eslint-disable no-unreachable */

module.exports = {
	cooldown: 100,
	help: `Links an image in a room.`,
	permissions: 'gamma',
	commandFunction: function (Bot, room, time, by, args, client) {
		return Bot.pm(by, 'Sorry, work in progress.');
		// Made irrelevant by !show
		if (!args[0]) return Bot.say(room, unxa);
		let line = args.join(' ');
		if (!/^https?:\/\//.test(line)) line = 'http://' + line;
		line = line.split('//');
		const link = line.splice(0, 2).join('//'), text = line.join('//');
		axios.get(link).then(body => {
			if (error) return Bot.say(room, 'Invalid link.');
			if (/\.(?:png|jpg|gif)$/.test(link)) {
				// eslint-disable-next-line max-len
				return Bot.say(room, `/adduhtml LINK, <img src="${link}" width="0" height="0" style="width:auto;height:auto"><br/>${text}`);
			}
			const image = body.match(/<img .*?>/i);
			if (!image) return Bot.say(room, "The given link doesn't have an image!");
			// eslint-disable-next-line max-len
			return Bot.say(room, `/adduhtml LINK, ${image[0].substr(0, image[0].length - 1)} width="0" height="0" style="width:auto;height:auto"><br/>${text}`);
		});
	}
};
