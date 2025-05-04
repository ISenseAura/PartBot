exports.handler = async message => {
	if (message.author.bot) return;
	if (message.channel.type === 'dm') {
		// eslint-disable-next-line max-len
		client.channels.cache.get('782853501327900706').send(`<@${message.author.id}> [${message.author.username}#${message.author.id}]: ${message.content}`);
	}
	// eslint-disable-next-line max-len
	if (!message.content.startsWith(prefix) && message.mentions && message.mentions.users && message.mentions.users.has(client.user.id)) {
		// eslint-disable-next-line max-len
		return message.channel.send(`Hi, I'm ${Bot.status.nickName}! I'm a bot by ${config.owner}. My command character is \`\`${prefix}\`\`.`);
	}
	if (!message.content.startsWith(prefix)) return require('./discord_chat.js').handle(message, Bot);
	const admins = config.discordAdmins;
	const args = message.content.substr(prefix.length).split(' ');
	let commandName = toID(args.shift());
	if (!commandName) return;
	commandName = require('../data/ALIASES/discord.json')[commandName] || commandName;
	try {
		if (['eval', 'output'].includes(commandName)) {
			// TODO: Better eval output + logging, handling asyncs
			if (!admins.includes(message.author.id)) {
				return message.channel.send('ACCESS DENIED.').then(msg => msg.delete({ timeout: 3000 }));
			}
			let output = eval(args.join(' '));
			Bot.lastEvaled = output;
			switch (typeof output) {
				case 'object': output = require('util').inspect(output);
				case 'function': output = output.toString(); break;
			}
			// eslint-disable-next-line max-len
			return message.channel.send('```\n' + output + '```').catch(e => message.channel.send('```\n' + output.substr(0, 1970) + '```').catch(e => {
				message.channel.send(e.message);
				Bot.log(e);
			}));
		}
		const dir = fs.readdirSync('./discord');
		if (!dir.includes(commandName + '.js')) {
			return message.channel.send("Doesn't look like that command exists...").then(msg => msg.delete({ timeout: 3000 }));
		}
		const commandFile = require(`../discord/${commandName}.js`);
		if (commandFile.guildOnly &&
			!(Array.isArray(commandFile.guildOnly) && commandFile.guildOnly.includes(message.guild.id)) &&
			!(typeof commandFile.guildOnly === "string" && String(commandFile.guildOnly) === message.guild.id) &&
			message.guild.id !== '719076445699440700'
		) {
			return message.channel.send('Not meant to be used here.').then(msg => msg.delete({ timeout: 3000 }));
		} else if (commandFile.admin && !admins.includes(message.author.id)) {
			return message.channel.send('Access denied.').then(msg => msg.delete({ timeout: 3000 }));
		} else if (message.type === 'dm') {
			if (!commandFile.pm) {
				return message.channel.send("This command isn't available in DMs, sorry...")
					.then(msg => msg.delete({ timeout: 3000 }));
			} else if (typeof commandFile.pm === 'function') return commandFile.pm(args, message, Bot);
		}
		if (commandFile.pmOnly) {
			return message.channel.send("This command is only available in DMs, sorry...").then(msg => msg.delete({ timeout: 3000 }));
		} else return commandFile.commandFunction(args, message, Bot);

	} catch (e) {
		message.channel.send(`Error: ${e.message}`);
		Bot.log(e);
	}
	return;
};
