module.exports = {
	help: `Displays a user's namecolour.`,
	permissions: 'none',
	commandFunction: function (Bot, by, args, client) {
		const HSL = tools.HSL(args.join('') || by);
		// eslint-disable-next-line max-len
		let html = `<strong style="color: hsl(${HSL.hsl[0]}, ${HSL.hsl[1]}%, ${HSL.hsl[2]}%);">${args.join(' ') || by.substr(1)}</strong> [Hex: ${tools.HSLtoHEX(...HSL.hsl)}, RGB: ${tools.HSLtoRGB(...HSL.hsl).join(', ')}, HSL: ${HSL.hsl[0]}, ${HSL.hsl[1]}%, ${HSL.hsl[2]}%]`;
		// eslint-disable-next-line max-len
		if (HSL.base) html += ` (${tools.colourize(HSL.source)})<br/>Original: <strong style="color: hsl(${HSL.base.hsl[0]}, ${HSL.base.hsl[1]}%, ${HSL.base.hsl[2]}%);">${HSL.base.source}</strong> [Hex: ${tools.HSLtoHEX(...HSL.base.hsl)}, RGB: ${tools.HSLtoRGB(...HSL.base.hsl).join(', ')}, HSL: ${HSL.base.hsl[0]}, ${HSL.base.hsl[1]}%, ${HSL.base.hsl[2]}%]`;
		Bot.sendHTML(by, html);
	}
};
