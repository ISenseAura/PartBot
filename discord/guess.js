const PZ = require('../data/PUZZLES/index.js');

module.exports = {
	help: `Makes a guess for an unlocked puzzle.`,
	guildOnly: [PZ.guildID, '871207224054272041'],
	commandFunction: function (args, message, Bot) {
		if (message.guild.id === '871207224054272041') {
			if (!['888995370238103582' /* Code channel */, '889548319238549514', '889548317338505256'].includes(message.channel.id)) {
				return message.channel.send("You don't look like a Death Match candidate...");
			}
			const obj = Bot.gtmm;
			if (!obj) return message.channel.send(`Hasn't started yet!`);
			const codes = { '888995370238103582': '12345', '889548319238549514': '74737', '889548317338505256': '12345' };
			const code = codes[message.channel.id].split('').map(n => ~~n);
			let input = toID(args.join(''));
			if (['status', 'guesses', 'history', 'list', 'past'].includes(input)) {
				const guesses = message.channel.guesses;
				if (!guesses.length) return message.channel.send(`You haven't made any guesses yet!`);
				const emotes = [
					'0️⃣', '1️⃣', '2️⃣', '3️⃣',
					'4️⃣', '5️⃣', '6️⃣', '7️⃣',
					'8️⃣', '9️⃣'
				];
				const rgs = guesses.slice().reverse().map((guess, i) => {
					return `${guess[0].map(t => emotes[t]).join('')} | ${guess[1][0]} 🔴 | ${guess[1][1]} ⚪ | #${guesses.length - i}`;
				});
				message.channel.send(`Your guesses:\n\n${rgs.join('\n')}`);
				return;
			} else input = String(input).replace(/[^\d]/g, '').split('').map(num => ~~num);
			if (obj[message.channel.id]) {
				return message.channel.send(`Cooling down! ${tools.toHumanTime(obj[message.channel.id] - Date.now())} left.`);
			}
			if (!message.channel.guesses) message.channel.guesses = [];
			if (message.channel.alreadyGuessed) {
				return message.channel.send(`But you already solved it in ${message.channel.guesses.length} tries!`);
			}
			if (input.length !== 5) return message.channel.send("Guess must be 5 numbers long!");
			let sol = code.slice(), guess = input.slice(), close = 0;
			const hits = [];
			for (let i = 0; i < 5; i++) {
				if (sol[i] === guess[i]) hits.push(i);
			}
			if (hits.length === 5) {
				// Correct guess
				message.channel.guesses.push([input, [5, 0]]);
				// eslint-disable-next-line
				message.channel.send(`You were correct! The code was ${code.join('')}, and you guessed it in ${message.channel.guesses.length} tries!`);
				client.channels.cache.get('906389929930682388').send(`<@!${message.author.id}> successfully guessed the code!`);
				message.channel.alreadyGuessed = true;
				return;
			}
			sol = sol.filter((t, i) => !hits.includes(i)).sort((a, b) => a - b);
			guess = guess.filter((t, i) => !hits.includes(i)).sort((a, b) => a - b);
			for (let i = 0; i < sol.length; i++) {
				while (sol.includes(guess[i])) {
					sol.remove(guess[i]);
					guess.remove(guess[i]);
					close++;
				}
			}
			message.channel.guesses.push([input, [hits.length, close]]);
			// eslint-disable-next-line
			message.channel.send(`You guessed \`${input.join('')}\` - ${hits.length} ${hits.length === 1 ? 'was' : 'were'} correct and in the right position, and ${close} ${close === 1 ? 'was' : 'were'} correct but in the wrong position.`);
			const endTime = Date.now() + 25 * 1000;
			obj[message.channel.id] = endTime;
			setTimeout(() => delete obj[message.channel.id], 25 * 1000);
			return;
		}
		if (!PZ.live) return message.channel.send("Sorry, this command may not be used at this time. 'o.o");
		const team = PZ.getTeam(message.member);
		if (!team) return message.channel.send("You don't seem to be participating... maybe contact one of our staff?");
		if (team.channel !== message.channel.id) {
			return message.channel.send("Please only use this in your own team's channel.").then(msg => {
				msg.delete({ timeout: 3000 });
				message.delete({ timeout: 30 });
			});
		}
		if (!args.length) return message.channel.send("Which puzzle?");
		const cargs = args.join(' ').split(/\s*,\s*/);
		if (cargs.length < 2) {
			// eslint-disable-next-line
			return message.channel.send(`Unexpected number of arguments - the correct syntax is \`${prefix}guess (puzzle ID), (your guess)\``);
		}
		const puzzle = PZ.getPuzzle(cargs.shift());
		const guess = cargs.join(',');
		if (!puzzle || !team.unlocked.includes(puzzle.index)) {
			return message.channel.send("Puzzle not found.");
		}
		PZ.guess(team, puzzle, guess).then(res => {
			if (res) {
				message.channel.send(`The correct answer was, indeed, ${puzzle.solution}!`);
				if (puzzle.index === "M") {
					message.channel.send(`**Congratulations! You have solved the metapuzzle!**`);
				} else {
					require('./puzzles.js').commandFunction([], message, Bot);
				}
			} else message.channel.send("Sorry, doesn't look like that was the answer...");
		}).catch(e => message.channel.send(e));
	}
};
