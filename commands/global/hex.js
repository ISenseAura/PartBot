module.exports = {
	cooldown: 1,
	help: `Displays the hex colour for a code.`,
	permissions: 'gamma',
	commandFunction: function (Bot, room, time, by, args, client) {
		if (!tools.canHTML(room)) return Bot.pm(by, 'Not a bot here, sorry');
		const hexes = args.join(' ').match(/[0-9a-f]{6}/g);
		if (!hexes.length) return Bot.roomReply(room, by, `No given hex found.`);
		const listHexHTML = hexes.map(hex => `<span style="background-color: #${hex}; padding: 5px; border-radius: 10px">BG</span>&nbsp;<span style="color: ${hex}">Text</span>`)
		Bot.say(room, `/adduhtml HEX,${listHexHTML.length > 3 ? `<details><summary>Click to expand</summary>${listHexHTML.join('<br/>')}</details>` : listHexHTML.join(' ')}`);
	}
};
