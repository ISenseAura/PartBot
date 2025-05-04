module.exports = {
	cooldown: 1,
	help: `-_-`,
	permissions: 'coder',
	commandFunction: function (Bot, room, time, by, args, client) {
		/* delete require.cache[require.resolve('../../data/chess.js')];
		if (!Bot.rooms[room].chess) Bot.rooms[room].chess = new tools.Chess(toID(by), room);
		let game = Bot.rooms[room].chess;
		game.B.player = 'partman';
		game.B.name = "PartMan";
		game.W.player = '1v1lt61hupartm';
		game.W.name = '1v1LT61HU PartM';
		game.setBoard();
		return Bot.say(room, `/adduhtml CHESS,${game.boardHTML(room, game.turn)}`); */
	}
};
