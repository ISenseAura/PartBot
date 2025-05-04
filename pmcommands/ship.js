module.exports = {
	help: `Ships!`,
	permissions: 'none',
	commandFunction: function (Bot, by, args, client) {
		if (!args.length) return Bot.pm(by, unxa);
		const cargs = args.join(' ').split(',').map(term => term.trim());
		if (cargs.length < 1 || cargs.length > 2) return Bot.pm(by, unxa);
		if (!cargs[1]) cargs.push(by.substr(1));
		const terms = Array.from(cargs);
		cargs.sort((a, b) => toID(a) > toID(b) ? 1 : -1);
		const comp = require('crypto')
			.createHash('md5')
			.update(toID(cargs[0]) + '&' + toID(cargs[1]), 'utf8')
			.digest('hex')
			.split('')
			.map(letter => tools.scrabblify(letter) ** 13)
			.reduce((a, b) => a + b) % 101;
		return Bot.pm(by, `I do declare that ${terms[0]} and ${terms[1]} are ${comp}% compatible!`);
	}
};
