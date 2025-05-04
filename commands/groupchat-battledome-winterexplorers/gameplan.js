module.exports = {
	cooldown: 1,
	help: ``,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client) {
		// eslint-disable-next-line max-len
		Bot.say(room, `/addhtmlbox Current gameplan:<br/>a) <strike>KILL FROZEN WATER</strike> Apparently not doable :sad:<br/>b) DON'T DIE UNTIL YOU'RE KILLED<br/>c) WIN<br/>d) Ranges: Line 6 AoE, Line 5, Cone 2 AoE, Melee Splash, Global splash on Lava<br/>e) YAY 3/5 EVASIONS AND NOT 0/8<br/>f) CRES IS UP, BATH WILL WH`);
	}
};
