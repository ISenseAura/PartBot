module.exports = {
	help: `Parses a leaderboard to add points to (for Hindi)`,
	guildOnly: '276374774018473985',
	commandFunction: function (args, message, Bot) {
		if (message.channel.id !== '784459957088419870') return message.channel.send('Use in the tournaments channel onegai');
		const text = args.join(' ');
		try {
			const tourRaw = text.match(/(?<=```).*?(?=```)/s).toString().trim();
			const tourData = tourRaw.split('|');
			const json = JSON.parse(tourData[3]);
			if (/casual|ignore|no ?points/i.test(json.format || '')) return;
			const pointsToAdd = {};
			const winners = [];
			switch (json.generator) {
				case 'Single Elimination': {
					if (json.bracketData.type !== 'tree') return;
					const root = json.bracketData.rootNode;
					winners.push(root.team);
					root.children?.forEach(child => {
						if (child.team !== winners[0]) winners.push(child.team);
					}); // add second place
					root.children?.forEach(child => {
						if (child.children) child.children.forEach(kid => {
							if (!winners.includes(kid.team)) winners.push(kid.team);
						}); // add runners-up
					});
					const scores = [];
					function browse (node) {
						if (!node || !node.team) return;
						if (node.children) {
							scores.push(node.team);
							node.children.forEach(browse);
						}
					}
					browse(root);
					scores.forEach(u => {
						pointsToAdd[u] ??= 0;
						pointsToAdd[u] += 1;
					});
					[3, 2, 1, 1].forEach((amt, index) => {
						if (winners[index]) {
							pointsToAdd[winners[index]] ??= 0;
							pointsToAdd[winners[index]] += amt;
						}
					});
					break;
				}
				case 'Double Elimination': {
					if (json.bracketData.type !== 'tree') return;
					const root = json.bracketData.rootNode;
					winners.push(root.team);
					root.children?.forEach(child => {
						if (child.team !== winners[0]) winners.push(child.team);
					}); // add second place
					const scores = [];
					function browse (node) {
						if (!node || !node.team) return;
						if (node.children) {
							scores.push(node.team);
							node.children.forEach(browse);
						}
					}
					browse(root);
					scores.forEach(u => {
						pointsToAdd[u] ??= 0;
						pointsToAdd[u] += 1;
					});
					[3, 2, 1].forEach((amt, index) => {
						if (winners[index]) {
							pointsToAdd[winners[index]] ??= 0;
							pointsToAdd[winners[index]] += amt;
						}
					});

					Object.keys(pointsToAdd).forEach(u => pointsToAdd[u] = Math.ceil(pointsToAdd[u] * 2 / 3));
					break;
				}
				default: return;
			}
			Bot.log(pointsToAdd);
			tools.addPoints(0, pointsToAdd, 'hindi', `+${message.author.username}`).then(obj => {
				message.channel.send(JSON.stringify(obj));
			});
		} catch (err) {
			message.channel.send(`Something went wrong! Error: ${err?.message || err}`);
			Bot.log(err);
		}
	}
};
