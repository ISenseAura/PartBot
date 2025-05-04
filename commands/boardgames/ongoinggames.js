// TODO: Make this work
// Also make the commands pluggable through the command interface

module.exports = {
	cooldown: 1000,
	help: `Displays a list of ongoing games.`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client) {
		let amt = 0;
		const games = [], Room = Bot.rooms[room];
		['chess', 'CR', 'othello', 'lightsout', 'mastermind'].forEach(bg => {
			let count = 0;
			const temp = [];
			switch (bg) {
				case 'chess': {
					let avb = 0;
					if (!Room[bg]) return games.push(`Chess (0)`);
					Object.values(Room[bg]).forEach(game => {
						count++;
						if (!game.started) avb++;
						// eslint-disable-next-line max-len
						temp.push(`${game.W.name ? tools.colourize(game.W.name) : `<button name="send" value="/msg ${Bot.status.nickName}, ${prefix}chess ${room} join ${game.id} White">White</button>`} vs ${game.B.name ? tools.colourize(game.B.name) : `<button name="send" value="/msg ${Bot.status.nickName}, ${prefix}chess ${room} join ${game.id} Black">Black</button>`} ${game.started ? `<button name="send" value ="/msg ${Bot.status.nickName}, ${prefix}chess ${room} spectate ${game.id}">Watch</button> ` : ''}(#${game.id})`);
					});
					if (!avb) return games.push(`Chess (0)`);
					games.push(`<details><summary>Chess (${avb}/${count})</summary>${temp.join('<br/>')}</details>`);
					break;
				}
				case 'CR': {
					if (!Room[bg]) return games.push(`Chain Reaction (0)`);
					// eslint-disable-next-line max-len
					games.push(`<details><summary>Chain Reaction (${Room[bg] ? '0' : '1'}/1)</summary>${game.order.map(player => game.players[player]).map(player => `<strong style="color:${player.col};">${player.name}<strong>`).join(', ')}${game.started ? '' : ` <button name="send" value="/msg ${Bot.status.nickName},${prefix}chainreaction ${room} join">`}</details>`);
					break;
				}
				case 'othello': {
					let avb = 0;
					if (!Room[bg]) return games.push(`Chess (0)`);
					Object.values(Room[bg]).forEach(game => {
						count++;
						if (!game.started) avb++;
						// eslint-disable-next-line max-len
						temp.push(`${game.W.name ? tools.colourize(game.W.name) : `<button name="send" value="/msg ${Bot.status.nickName}, ${prefix}othello ${room} join ${game.id} White">White</button>`} vs ${game.B.name ? tools.colourize(game.B.name) : `<button name="send" value="/msg ${Bot.status.nickName}, ${prefix}othello ${room} join ${game.id} Black">Black</button>`} ${game.started ? `<button name="send" value ="/msg ${Bot.status.nickName}, ${prefix}othello ${room} spectate ${game.id}">Watch</button> ` : ''}(#${game.id})`);
					});
					if (!avb) return games.push(`Othello (0)`);
					games.push(`<details><summary>Othello (${avb}/${count})</summary>${temp.join('<br/>')}</details>`);
					break;
				}
				case 'lightsout': {
					if (!Room[bg]) return games.push(`Lights Out (0)`);
					break;
				}
				case 'mastermind': {
					if (!Room[bg]) return games.push(`Mastermind (0)`);
					break;
				}
				case 'scrabble': {
					if (!Room[bg]) return games.push(`Scrabble (0)`);
					break;
				}
				case 'ludo': {
					if (!Room[bg]) return games.push(`Ludo (0)`);
					break;
				}
				default: return null;
			}
			amt += count;
		});
		const html = `<details><summary><b>Ongoing Games</b> (${amt})</summary><hr />${games.join('<hr />')}</details>`;
		if (tools.hasPermission(by, 'gamma', room)) return Bot.say(room, `/adduhtml GAMES_MENU,${html}`);
		else Bot.sendHTML(by, html);
	}
};
