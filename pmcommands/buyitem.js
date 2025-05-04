module.exports = {
	help: `Buys an item from a room. Syntax: ${prefix}buyitem (room), (item ID | confirm)`,
	permissions: 'none',
	commandFunction: function (Bot, by, args, client) {
		let user = toID(by);
		const cargs = args.join(' ').split(/\s*,\s*/);
		if (!cargs[1]) return Bot.pm(by, unxa);
		const room = cargs.shift().toLowerCase().replace(/[^a-z0-9-]/g, '');
		if (!room || !Bot.rooms[room]) return Bot.pm(by, 'Invalid room.');
		if (!Bot.rooms[room].shop) return Bot.pm(by, 'Sorry, that room doesn\'t have a Shop.');
		const shop = Bot.rooms[room].shop, lb = Bot.rooms[room].lb;
		const id = toID(cargs.join(''));
		if (id === 'confirm') {
			if (!Bot.rooms[room].shop.temp[user]) return Bot.pm(by, 'You don\'t have anything to confirm!');
			const item = Bot.rooms[room].shop.inventory[Bot.rooms[room].shop.temp[user]];
			user = lb.users[user];
			if (!user) return Bot.pm(by, "Couldn't find your details, sorry.");
			for (let i = 0; i < user.points.length; i++) {
				if (user.points[i] < item.cost[i]) {
					Bot.pm(by, 'Something went wrong with your purchase. You have not been charged.');
					return Bot.log("URGENT: Price limiter fail!");
				}
			}
			try {
				client.channels.cache.get(shop.channel).send(`${by.substr(1)} bought: ${item.name}.`);
			} catch (e) {
				Bot.log('Unable to send purchase confirmation.', item, by);
				Bot.pm(by, 'Your purchase has gone through. Please contact PartMan.');
			}
			Bot.rooms[room].points.forEach((_, i) => user.points[i] -= item.cost[i]);
			tools.updateLB();
			delete Bot.rooms[room].shop.temp[toID(by)];
			tools.updateShops(room);
			return Bot.pm(by, `Your purchase of ${item.name} has been noted! Staff will get back to you soon. <3`);
		}
		if (!shop.inventory[id]) return Bot.pm(by, 'Sorry, it doesn\'t look like that item is available.');
		Bot.pm(by, `Selected item: ${shop.inventory[id].name}${shop.inventory[id].desc ? ` (${shop.inventory[id].desc})` : ''}.`);
		user = lb.users[user];
		if (!user) return Bot.pm(by, 'Sorry, it looks like you can\'t afford that yet!');
		if (user.points.length !== shop.inventory[id].cost.length || user.points.length !== lb.points.length) {
			return Bot.pm(by, 'Sorry, this went terribly wrong - the item in question has not been coded properly.');
		}
		for (let i = 0; i < user.points.length; i++) {
			if (!(user.points[i] >= shop.inventory[id].cost[i])) {
				return Bot.pm(by, `Insufficient balance - you need ${shop.inventory[id].cost[i]} more ${lb.points[i][2]}.`);
			}
		}
		Bot.rooms[room].shop.temp[toID(by)] = id;
		const item = shop.inventory[id];
		// eslint-disable-next-line max-len
		Bot.pm(by, `You have chosen to buy: ${item.name} for ${tools.listify(lb.points.map((a, i) => item.cost[i] + a[2]))}. Send \`\`${prefix}buyitem ${Bot.rooms[room].title.startsWith('groupchat-') ? room : Bot.rooms[room].title}, confirm\`\` to confirm within a minute.`);
		return setTimeout(() => {
			if (Bot.rooms[room].shop.temp[toID(by)]) {
				Bot.pm(by, 'Your purchase has timed out.');
				delete Bot.rooms[room].shop.temp[toID(by)];
			}
		}, 60000);
	}
};
