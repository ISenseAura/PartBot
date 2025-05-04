exports.reactToReacts = (reaction, user) => {
	if (reaction.message.channel.id === '952343311182602290') {
		// First is #code-2, second is actual
		if (reaction._emoji.name === '✅' && reaction.count === 2) {
			// Checked!
			const message = reaction.message;
			const matches = message.content.match(/(?:\*\*.*?\*\*|https:\/\/replay.pokemonshowdown.com\/[a-z0-9A-Z-]*)/g);
			if (!matches || matches.length !== 3) return message.channel.send('Unable to find challenge/user/replay');
			const [challenge, challenger, replay] = matches.map(str => str.replace(/(?:^\*\*|\*\*$)/g, ''));
			const difficulty = Bot.DB('trickhouse').get(toID(challenge));
			const id = Date.now();
			// eslint-disable-next-line max-len
			const html = `<form data-submitsend="/w ${Bot.status.nickName},${prefix}trickhouse {challenger}, {difficulty}, {replay}, ${id}">Challenge detected for user <input type="text" value="${challenger}" name="challenger"/> of difficulty <select name="difficulty"><option name="difficulty" value="1"${difficulty === 1 ? 'selected' : ''}>Easy</option><option name="difficulty" value="2"${difficulty === 2 ? 'selected' : ''}>Medium</option><option name="difficulty" value="3"${difficulty === 3 ? 'selected' : ''}>Hard</option></select> (the ${challenge} Challenge). Challenge replay: <input type="text" placeholder="Paste replay link here" name="replay" value="${replay}" style="width:400px"/><br/><button>Submit!</button></form>`;
			const Room = Bot.rooms.trickhouse;
			if (!Room) return message.channel.send(`Wait I don't seem to be in the room oops`);
			if (!Room.vers) Room.vers = {};
			Room.vers[id] = { challenge, challenger, replay, html };
			Bot.say('trickhouse', `/addrankuhtml %, trickhouse-${toID(challenge)}-${toID(challenger)}-${id}, ${html}`);
		}
	}
};

exports.loadMessages = async client => {
	return;
	await client.channels.cache.get('766946356018413588').messages.fetch();
	await client.channels.cache.get('952343311182602290').messages.fetch();
};
