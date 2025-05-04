module.exports = {
	cooldown: 1000,
	help: `Filters through all Pokemon names using RegExp. Tutorial: https://regexone.com/lesson/introduction_abcs`,
	permissions: 'none',
	commandFunction: function (Bot, by, args, client) {
		try {
			const regex = new RegExp(args.join(' ').trim(), 'i');
			const out = Object.keys(data.pokedex).filter(m => data.pokedex[m].num > 0 && regex.test(m));
			if (!out.length) return Bot.pm(by, 'None.');
			// eslint-disable-next-line max-len
			return Bot.sendHTML(by, `<details style="font-family:'Arial',monospace;"><summary>Results (${out.length})</summary>` + out.map(m => data.pokedex[m].name).sort().join('<br>') + '</details>');
		} catch {
			Bot.pm(by, "RegEx doesn't work that way - try taking a look at https://regexone.com/lesson/introduction_abcs");
		}
	}
};
