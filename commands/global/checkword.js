module.exports = {
	cooldown: 0,
	help: `Checks whether a given word is Scrabble-legal. Syntax: \`\`${prefix}checkword word(, dict, mod)\`\``,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client) {
		const WORDS = require('../../data/WORDS/index.js');
		const [word, dict, mod] = args.join('').split(',');
		let memeOverride = false;
		if (room === 'boardgames' && toID(word) === 'plisaweeb') memeOverride = true;
		const displayWord = toID(word).toUpperCase();
		const text = `${displayWord} is ${memeOverride || WORDS.checkWord(word, dict, mod || 'pokemon') ? '' : 'not '} a Scrabble-legal word.`;
		if (tools.hasPermission(by, 'gamma', room)) Bot.say(room, text);
		else Bot.roomReply(room, by, text);
	}
};
