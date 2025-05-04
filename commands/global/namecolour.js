module.exports = {
	cooldown: 10,
	help: `Shows a user's namecolour.`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client) {
		const name = (args.join(' ') || by).replace(/[^a-zA-Z0-9 -]/g, '');
		const HSL = tools.HSL(name);
		// eslint-disable-next-line max-len
		let html = `${HSL.base ? '<b>Current</b>: ' : ''} <strong style="color: hsl(${HSL.hsl[0]}, ${HSL.hsl[1]}%, ${HSL.hsl[2]}%);">${name}</strong> | ${tools.HSLtoHEX(...HSL.hsl)} | RGB(${tools.HSLtoRGB(...HSL.hsl).join(',')}) | HSL(${HSL.hsl[0]},${HSL.hsl[1]}%,${HSL.hsl[2]}%)`;
		if (HSL.base) {
			// eslint-disable-next-line max-len
			html += ` (${tools.colourize(HSL.source)})<br/><b>Original</b>: <strong style="color: hsl(${HSL.base.hsl[0]}, ${HSL.base.hsl[1]}%, ${HSL.base.hsl[2]}%);">${name}</strong>  | ${tools.HSLtoHEX(...HSL.base.hsl)} | RGB(${tools.HSLtoRGB(...HSL.base.hsl).join(',')}) | HSL(${HSL.base.hsl[0]},${HSL.base.hsl[1]}%,${HSL.base.hsl[2]}%)`;
		}
		if (tools.hasPermission(by, 'gamma', room) && tools.canHTML(room)) return Bot.say(room, `/addhtmlbox ${html}`);
		else Bot.sendHTML(by, html);
	}
};
