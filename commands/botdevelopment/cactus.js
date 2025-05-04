module.exports = {
	cooldown: 1,
	help: `Form link.`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client) {
		const hexes = args.join('').split(',').map(toID);
		const L = hexes.length;
		const board = Array.from({ length: L }).map((r, i) => Array.from({ length: L }).map((_, num) => num + i * (i + 1) / 2));
		// eslint-disable-next-line max-len
		Bot.say(room, `!htmlbox ${board.map(row => row.map(i => `<span style="color:#${hexes[i % L]};background-color:black;border:0.5px solid white;display:inline-block;height:25px;width:25px;line-height:25px;text-align:center;font-family:Verdana;">3</span>`).join('')).join('<br/>')}`);
	}
};
