/* eslint-disable no-unreachable */

module.exports = {
	help: `Hunt Board Games roomauth!`,
	noDisplay: true,
	permissions: 'none',
	commandFunction: function (Bot, by, args, client) {
		return Bot.pm(by, `B-but UGO is over!`);
		const uID = toID(by);
		if (!tools.hasPermission(by, 'boardgames', 'gamma') || Bot.rooms.boardgames?.users.find(u => toID(u) === uID)?.match(/^ /)) {
			return Bot.pm(by, `Access denied - please ask the auth member to PM me \`\`${prefix}rttt ${toID(by)}\`\``);
		}
		const cargs = args.join(' ').split(',').map(term => term.trim());
		if (cargs.length !== 2) return Bot.pm(by, unxa);
		const targetID = toID(cargs[0]);
		const target = Bot.rooms.boardgames?.users.find(u => toID(u) === targetID)?.replace(/@!$/, '').substr(1);
		if (!target) return Bot.pm(by, `Unable to find the target in Board Games!`);
		const user = by.substr(1).replace(/@!$/, '');
		const players = {
			'X': cargs[1].toUpperCase() === 'X' ? target : user,
			'O': cargs[1].toUpperCase() === 'O' ? target : user
		};
		const moves = Array.from({ length: 9 }).map((_, i) => i).shuffle();
		const board = Array.from({ length: 9 }).fill(null);
		const HTMLs = [];
		let turn = true;
		let result = 'O';
		while (moves.length) {
			const move = moves.shift();
			const isTurn = 'XO'[~~(turn = !turn)];
			board[move] = isTurn;
			tempBoard = [board.slice(0, 3), board.slice(3, 6), board.slice(6, 9)];
			// eslint-disable-next-line max-len
			HTMLs.push(`<center><table style="border-collapse:collapse;border:2px solid;margin:30px">${tempBoard.map(row => `<tr style="height:30px">${row.map(cell => `<td style="border:2px solid;width:30px;text-align:center;line-height:30px">${cell || '&nbsp;'}</td>`).join('')}</tr>`).join('')}</table></center>`);
			function isWon () {
				const squares = { X: [], O: [] };
				for (let i = 0; i < 3; i++) {
					for (let j = 0; j < 3; j++) {
						if (tempBoard[i][j]) squares[tempBoard[i][j]].push([i, j]);
					}
				}
				for (let i = 0; i < 3; i++) {
					if (squares.X.filter(term => term[0] === i).length === 3) return 'X';
					if (squares.X.filter(term => term[1] === i).length === 3) return 'X';
					if (squares.O.filter(term => term[0] === i).length === 3) return 'O';
					if (squares.O.filter(term => term[1] === i).length === 3) return 'O';
				}
				if (tempBoard[0][0] === tempBoard[1][1] && tempBoard[1][1] === tempBoard[2][2]) return tempBoard[0][0];
				if (tempBoard[2][0] === tempBoard[1][1] && tempBoard[1][1] === tempBoard[0][2]) return tempBoard[1][1];
				return 0;
			}
			const win = isWon();
			if (win) {
				result = win;
				break;
			}
		}
		const winner = players[result];
		if (winner === target) result = ' won against ';
		else if (winner === user) result = ' lost against ';
		// eslint-disable-next-line max-len
		HTMLs[HTMLs.length - 1] = `<center><h1>${target}${result}${user}</h1><br/>` + HTMLs[HTMLs.length - 1] + (winner === target ? `<form data-submitsend="/msgroom ugo,/pm UGO,;authhunt ${target}, Board Games"><input type="submit" value="Click to award points!" name="Click to award points!"></form>` : '') + '</center>';
		// declare 'result'
		function timer () {
			if (!HTMLs.length) return Bot.say('ugo', `/modnote [boardgamesauthhunt] [${toID(target)}]${result}[${toID(user)}]`);
			const HTML = HTMLs.shift();
			Bot.say('boardgames', `/sendhtmlpage ${target}, rttt${target}${user}, ${HTML.replace(/<form.*?form>/, '')}`);
			Bot.say('boardgames', `/sendhtmlpage ${user}, rttt${target}${user}, ${HTML}`);
			setTimeout(timer, 3000);
		}
		timer();
	}
};
