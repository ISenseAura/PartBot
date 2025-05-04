module.exports = {
	cooldown: 1,
	help: `Event ke wakt iss command se answer karna hai - \`\`${prefix}answer (aapka answer)\`\``,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client) {
		function score (name, index) {
			let points;
			const username = Bot.rooms[room].users.find(u => toID(u) === name).substr(1);
			// console.log(name, Bot.rooms[room].users);
			tools.addPoints(0, { [username]: points = index > 3 ? 2 : 5 - index }, 'groupchat-hindi-event', '_Event').then(() => {
				Bot.pm(name, `Aapko ${points} points mile!`);
			}).catch(err => {
				Bot.pm(name, err.message);
				Bot.log(err);
				Bot.pm(name, points);
			});
			return username + ` [${points}]`;
		}
		const info = Bot.rooms[room].event;
		if (!info) return Bot.pm(by, "Event filhaal nahi chal raha...");
		if (!info.sol) return Bot.pm(by, "Sabar karo zaraa...");
		if (!info.active) return Bot.pm(by, "Late ;-;");
		const id = toID(by);
		const ans = toID(args.join(''));
		const sol = toID(info.sol);
		const offset = levenshtein(ans, sol);
		if (offset > 1) return Bot.pm(by, `Aapka answer galat tha. ;-;`);
		if (!info.solved.length) {
			info.timer = setTimeout(() => {
				info.active = false;
				Bot.say(room, `/wall Time khatm! Winners the: ${tools.listify(info.solved.map(score))}`);
				Bot.log(info.solved);
				info.solved = [];
				clearTimeout(info.dqTimer);
				Bot.say('groupchat-hindi-event', "Next");
			}, 3000);
		} else if (info.solved.includes(id)) return Bot.pm(by, "Aapne already answer kiya hai...");
		info.solved.push(id);
		Bot.pm(by, "Aapka jawaab sahi hai!");
	}
};
