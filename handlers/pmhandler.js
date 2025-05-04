module.exports = function handler (by, message) { 
	if (message.startsWith('/invite')) {
		for (const room of config.autoJoin) if (message.startsWith(`/invite ${room}`)) return Bot.joinRooms([room]);
		if (['+', '%', '@', '&', '~'].includes(by.charAt(0)) || tools.hasPermission(by, 'beta')) {
			return Bot.joinRooms([message.split('/invite')[1]]);
		}
		if (message.startsWith('/invite battle-')) return Bot.joinRooms([message.split('/invite ')[1]]);
		return Bot.pm(by, "Sorry, only global staff can invite me.");
	}
	if (message.startsWith('|requestpage|')) {
		const [, reqp, user, title] = message.split('|');
		if (!title) return;
		return Bot.pageHandler(by, title);
	}
	if (message.startsWith('/challenge ')) {
		const validTiers = Bot.teams;
		const [tier] = message.substr('/challenge '.length).split('|');
		if (tier === 'constructor') return Bot.pm(by, 'Okay this is getting out of hand now');
		if (!validTiers[tier]) {
			Bot.pm(by, `Sorry, I don't play that! Valid tiers are: ${Object.values(validTiers).map(t => t.name).join(', ')}`);
			return Bot.say('', `/reject ${by}`);
		}
		const team = validTiers[tier].teams?.random();
		if (team) Bot.say('', `/utm ${team}`);
		Bot.say('', `/accept ${by}`);
		Bot.log(`Fighting ${by}`);
	}
	if (message.toLowerCase().includes('mental math')) {
		if (Bot.rooms[mmroom]) return Bot.say(mmroom, '/invite ' + by);
		else return Bot.pm(by, 'Sorry, but the groupchat is down.');
	}
	if (message.startsWith('/botmsg ')) message = message.substr(8);
	if (!message.startsWith(prefix)) {
		if (config.debug) {
			// eslint-disable-next-line max-len
			client.channels.cache.get('826473646944026644').send(`${by}: ${message.substr(0, 1950) + (message.length > 1950 ? '...' : '')}`.replace(/@(?:everyone|here)/g, m => `@\u200b${m.substr(1)}`));
		}
		if (message.toLowerCase().includes('invite')) {
			if (!Bot.rooms[tcroom]) return Bot.pm(by, 'Not currently up, sorry.');
			return Bot.say(tcroom, '/invite ' + by);
		}
		if (/krytoconiscute/.test(toID(message))) {
			if (!Bot.rooms['groupchat-partbot-1v1mnm']) return Bot.pm(by, 'Nah, you missed it.');
			return Bot.say('groupchat-partbot-1v1mnm', '/invite ' + by);
		}
		if (!Bot.auth.admin.includes(toID(by))) {
			if (Bot.lastPMHelp === toID(by)) return;
			Bot.lastPMHelp = toID(by);
			// eslint-disable-next-line max-len
			return Bot.pm(by, `Hi, I'm ${Bot.status.nickName}! I'm a Bot. My prefix is \`\`${prefix}\`\`. For an overview of my commands, use \`\`${prefix}commands\`\`.`);
		}
		return;
	}
	const args = message.substr(prefix.length).split(' ');
	const commandName = tools.pmCommandAlias(args.shift());
	if (!commandName) return;
	if (['eval', 'output'].includes(commandName)) {
		if (!tools.hasPermission(toID(by), 'admin')) return Bot.pm(by, 'Access denied.');
		try {
			let outp = eval(args.join(' '));
			switch (typeof outp) {
				case 'object': outp = JSON.stringify(outp, null, 2); break;
				case 'function': outp = outp.toString(); break;
				case 'undefined': outp = 'undefined'; break;
			}
			Bot.pm(by, '!code ' + String(outp));
		} catch (e) {
			console.log(e); Bot.pm(by, e.message); Bot.log(e);
		}
		return;
	}
	fs.readdir('./pmcommands', (err, files) => {
		if (err) {
			Bot.auth.admin.forEach(adm => Bot.pm(adm, err.message)); Bot.log(err);
		}
		const commands = files.map(file => file.slice(0, file.length - 3));
		if (!commands.includes(commandName)) return Bot.pm(by, `It doesn't look like that command exists.`);
		const commandRequire = require(`../pmcommands/${commandName}.js`);
		if (!tools.hasPermission(by, commandRequire.permissions)) {
			return Bot.pm(by, 'Access denied.');
		}
		try {
			commandRequire.commandFunction(Bot, by, args, client);
		} catch (e) {
			if (e) {
				Bot.pm(by, e.message); return Bot.log(e);
			}
		}
	});
	return;
};
