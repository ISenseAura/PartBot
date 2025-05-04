module.exports = function (room, time, by, message) { 
	if (typeof Bot.jpcool[room] === 'object') Object.keys(Bot.jpcool[room]).forEach(user => Bot.jpcool[room][user][0]++);
	if (toID(by) === toID(Bot.status.nickName)) return; // Botception
	if (tools.hasPermission(by, 'none', room)) require('./autores.js').check(message, by, room);
	if (!message.startsWith(prefix)) return;
	if (message === `${prefix}eval 1`) return Bot.say(room, '1');
	const args = message.substr(prefix.length).split(' ');
	if (args[0].toLowerCase() === 'constructor') {
		return Bot.say(room, `/me constructs a constrictor to constrict ${by.substr(1)}`);
	}
	const commandName = tools.commandAlias(args.shift().toLowerCase());
	if (!commandName) return;
	if (['eval', 'output'].includes(commandName)) {
		// TODO: Scope this to root
		if (!tools.hasPermission(toID(by), 'admin')) return Bot.pm(by, 'Access denied.');
		(async () => {
			try {
				const output = eval(args.join(' '));
				let outStr = output?.constructor.toString().includes('AysncFunction()') ? await output : output;
				switch (typeof outStr) {
					case 'object': outStr = commandName === 'eval' ? JSON.stringify(outStr) : util.inspect(outStr); break;
					case 'function': outStr = outStr.toString(); break;
				}
				const postStr = String(outStr).replaceAll(config.pass, '***');
				if (commandName === 'eval') {
					Bot.say(room, postStr);
				} else {
					Bot.say(room, '!code ' + postStr);
				}
			} catch (e) {
				Bot.log(e);
				Bot.say(room, e.message);
			}
		})();
		return;
	}
	return Bot.commandHandler(commandName, by, args, room);
};
