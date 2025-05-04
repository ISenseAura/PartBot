module.exports = function (command, by, args, room, isPM, ...extraArgs) {
	room = tools.getRoom(room);
	command = command.toLowerCase();
	const blocked = Boolean(Bot.rooms[room]?.ignore || Bot.rooms[room]?.blacklist?.includes(command));
	if (blocked && !tools.hasPermission(by, 'coder') && !Bot.rooms[room]?.whitelist?.includes(command)) {
		return Bot.pm(by, `${Bot.rooms[room].ignore ? 'Most commands are' : 'This command is'} disabled in ${room}.`);
	}
	let commandReq;
	try {
		commandReq = require(`../commands/${room}/${command}.js`);
	} catch {
		commandReq = require(`../commands/global/${command}.js`);
	} finally {
		if (!commandReq) return Bot.pm(by, `Sorry, doesn't look like that command exists!`);
		if (!tools.hasPermission(by, Bot.rooms[room]?.permissions?.[command] || commandReq.permissions, room)) {
			return Bot.pm(by, "Access denied.");
		}
		try {
			if (cooldownObject[room] && cooldownObject[room][command]) return Bot.pm(by, "Sorry, cooling down.");
			const out = commandReq.commandFunction(Bot, room, Date.now(), by, args, client, isPM, ...extraArgs);
			tools.setCooldown(command, room, commandReq);
			return out;
		} catch (err) {
			Bot.pm(by, `Sorry, something went wrong! Error: ${err.message}`);
			Bot.log(err);
		}
	}
};
