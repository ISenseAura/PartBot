module.exports = {
	help: `Hunt Board Games roomauth!`,
	permissions: 'none',
	commandFunction: function (Bot, by, args, client) {
		return Bot.pm(by, `B-but UGO is over!`);
		// eslint-disable-next-line no-unreachable
		const uID = toID(by);
		if (!tools.hasPermission(by, 'boardgames', 'gamma') || Bot.rooms.boardgames?.users.find(u => toID(u) === uID)?.match(/^ /)) {
			return Bot.pm(by, `Access denied - please ask the auth member to PM me \`\`${prefix}rttt ${toID(by)}\`\``);
		}
		const targetID = toID(args.join(''));
		const target = Bot.rooms.boardgames?.users.find(u => toID(u) === targetID)?.replace(/@!$/, '').substr(1);
		if (!target) return Bot.pm(by, `Unable to find the target in Board Games!`);
		const user = by.substr(1).replace(/@!$/, '');
		// eslint-disable-next-line max-len
		Bot.say('boardgames', `/sendhtmlpage ${user}, RTTT-${target}-${user}, <center><button name="send" value="/msgroom boardgames,/botmsg ${Bot.status.nickName},${prefix}rttts ${target},X" style="font-size:1.5em;background:none;padding:20px;color:inherit;border:1px solid;border-radius:10px;margin:50px"><username>${target}</username>: X<br/><username>${user}</username>: O</button name="send" value="/msgroom boardgames,/botmsg ${Bot.status.nickName},${prefix}rttts ${target},X"><button name="send" value="/msgroom boardgames,/botmsg ${Bot.status.nickName},${prefix}rttts ${target},O" style="font-size:1.5em;background:none;padding:20px;color:inherit;border:1px solid;border-radius:10px;margin:50px"><username>${target}</username>: O<br/><username>${user}</username>: X</button name="send" value="/msgroom boardgames,/botmsg ${Bot.status.nickName},${prefix}rtttstart ${target}, "></center>`);
	}
};
