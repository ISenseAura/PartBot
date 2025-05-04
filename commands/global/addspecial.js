module.exports = {
	cooldown: 100,
	help: `Adds points to users. Syntax: ${prefix}add (type), (user1), (user2), (points)`,
	permissions: 'beta',
	commandFunction: function (Bot, room, time, by, args, client) {
		if (!Bot.rooms[room].lb) return Bot.say(room, 'This room doesn\'t have a Leaderboard!');
		if (!Bot.rooms[room].lb.points[0]) return Bot.pm(by, 'This room doesn\'t have that currency. o.o');
		const cargs = args.join(' ').split(/\s*,\s*/);
		const type = 1, cur = Bot.rooms[room].lb.points[type];
		if (!cur) return Bot.pm(by, this.help);
		let points, flag = false;
		const users = [];
		for (const thing of cargs) {
			if (/[a-z]/i.test(thing)) users.push(thing);
			else {
				const n = parseInt(thing);
				if (isNaN(n)) return Bot.say(room, `Invalid number.`);
				if (flag) return Bot.say(room, `Uhh, you gave multiple values of ${cur[1]} to be added.`);
				flag = true;
				points = n;
			}
		}
		if (!flag) points = 1;
		tools.addPoints(type, Object.fromEntries(users.map(user => [user, points])), room, by).then(res => {
			const list = tools.listify(Object.keys(res));
			Bot.say(room, `${points} ${points === 1 ? cur[0] : cur[1]} ${points === 1 ? 'was' : 'were'} awarded to ${list}.`);
		}).catch(e => {
			Bot.say(room, `Something went wrong: ${e.message}`);
			console.error(e);
		});
	}
};
