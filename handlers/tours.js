// TODO: Emit events

module.exports = function (room, tourData, Bot) {
	if (tourData?.[0] === 'create') {
		// if (room === 'hindi') setTimeout(() => Bot.rooms.hindi.tourPinged = false, 10 * 60 * 1000);
		try {
			const roomData = require(`../data/ROOMS/${room}.json`);
			if (roomData.tour && ['*', '#', '★'].includes(Bot.rooms[room].rank)) {
				setTimeout(() => {
					Bot.say(room, `/tour autostart ${roomData.tour[0]}\n/tour autodq ${roomData.tour[1]}`);
				}, roomData.tour[2] || 2000);
			}
		} catch {}
	}
	if (room === 'hindi') {
		if (!tourData) return;
		if (tourData[0] === 'battlestart') {
			Bot.say('', '/j ' + tourData[3]);
			return setTimeout((room, text) => Bot.say(room, text), 1000, tourData[3], `G'luck!\n/part`);
		} else if (tourData[0] === 'update') {
			try {
				const json = JSON.parse(tourData[1]);
				if (json.generator !== 'Single Elimination') return;
				if (!json.bracketData) return;
				if (json.bracketData.type !== 'tree') return;
				if (!json.bracketData.rootNode) return;
				if (json.bracketData.rootNode.state === 'inprogress') {
					Bot.say(room, `/wall Tour finals! <<${json.bracketData.rootNode.room}>>`);
				}
			} catch (e) {
				Bot.log(e);
			}
		} else if (tourData[0] === 'end') {
			try {
				// The actual algorithm is secret
				// Nice try, though
				Bot.commandHandler('leaderboard', '#PartMan', [], room);
			} catch (e) {
				Bot.log(e);
			}
		}
	}
	if (room === 'galligallisimsim') {
		if (tourData?.[0] === 'end') {
			setTimeout(() => Bot.say(room, '/modchat +'), 5 * 60_000);
		}
	}
};
