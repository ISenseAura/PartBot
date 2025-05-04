// UGOCODE
/*
const gameLimit = 1000;
const pointsLimit = 20;
const gameName = 'chess';
const gameTitle = 'Chess';
const pointsWin = 24;
const pointsDraw = 18;
const pointsLose = 15;
*/

function sendEmbed (room, W, B, pgn) {
	const CHESS = GAMES.get('chess');
	CHESS.uploadToLichess(pgn).then(url => {
		if (!url) return tools.uploadToPastie(pgn).then(u => Bot.say(room, `Err, couldn't upload to Lichess; take ${u} instead.`));
		Bot.say(room, url);
		if (!['boardgames'].includes(room)) return;
		const Embed = require('discord.js').MessageEmbed, embed = new Embed();
		embed.setColor('#9C5624').setAuthor("Chess - Room Match", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Chess_tile_kl.svg/1200px-Chess_tile_kl.svg.png").setTitle(`${W} vs ${B}`).setURL(url);
		client.channels.cache.get("576488243126599700").send(embed).catch(e => {
			Bot.say(room, 'Unable to send ' + url + ' to the Discord because ' + e.message);
			Bot.log(e);
		});
	}).catch(err => {
		Bot.log(err);
		tools.uploadToPastie(pgn).then(u => Bot.say(room, `Err, couldn't upload to Lichess; take ${u} instead.`));
	});
}

function runMoves (run, info, game) {
	const CHESS = GAMES.get('chess');
	const room = game.room, id = game.id;
	switch (run) {
		case 'start': {
			game.started = true;
			game.setBoard();
			Bot.say(room, `Chess: ${game.W.name} vs ${game.B.name} GOGO`);
			game.spectatorSend(`<center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>BOARDHTML</center>`).then(() => {
				Bot.say(room, `/sendhtmlpage ${game.W.id}, Chess + ${room} + ${id}, ${game.turn === "W" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML('W')}</center>`);
				Bot.say(room, `/sendhtmlpage ${game.B.id}, Chess + ${room} + ${id}, ${game.turn === "B" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML('B')}</center>`);
				setTimeout(() => {
					Bot.say(room, `/highlighthtmlpage ${game.W.id}, Chess + ${room} + ${id}, Your turn!`);
				}, 1000);
				Bot.say(room, `/adduhtml CHESS-${id},<hr />${tools.colourize(game.W.name)} vs ${tools.colourize(game.B.name)}! <div style="text-align: right; display: inline-block; font-size: 0.9em; float: right;"><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} spectate ${id}">Watch!</button></div><hr />`);
			});
			return;
			break;
		}
		case 'join': {
			const { user, side } = info;
			game[side].id = toID(user);
			game[side].name = user.replace(/[<>]/g, '');
			if (game.W.id && game.B.id) return runMoves('start', null, game);
			const html = `<hr /><h1>Chess Signups are active!</h1>${["W", "B"].filter(side => !game[side].id).map(side => `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room}, join ${id} ${side === 'W' ? 'White' : 'Black'}">${side === 'W' ? 'White' : 'Black'}</button>`).join('&nbsp;')}<hr />`;
			return Bot.say(room, `/adduhtml CHESS-${id}, ${html}`);
			break;
		}
		case 1: {
			// Move
			game.spectatorSend(`<center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.W.id}, Chess + ${room} + ${id}, ${game.turn === "W" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML('W')}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Chess + ${room} + ${id}, ${game.turn === "B" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML('B')}</center>`);
			if (game[game.turn].preMove.length) setTimeout(module.exports.commandFunction, 100, Bot, game.room, null, ' ' + game[game.turn].name, ['play', String(game.id), game[game.turn].preMove.join('-')], client);
			else {
				setTimeout(() => {
					Bot.say(room, `/highlighthtmlpage ${game[game.turn].id}, Chess + ${room} + ${id}, Your turn!`);
				}, 1000);
			}
			break;
		}
		case 2: {
			// Promotion
			Bot.say(room, `/sendhtmlpage ${game[game.turn].id}, Chess + ${room} + ${id}, <center><h1 style="text-align: center;">Promotion Time!</h1>${game.boardHTML(game.turn)}</center><br/><center><br/><button name="send" value="/msgroom ${room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} promote ${id} ${info} Queen">Queen</button> <button name="send" value="/msgroom ${room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} promote ${id} ${info} Rook">Rook</button> <button name="send" value="/msgroom ${room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} promote ${id} ${info} Bishop">Bishop</button> <button name="send" value="/msgroom ${room},/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} promote ${id} ${info} Knight">Knight</button></center>`);
			setTimeout(() => {
				Bot.say(room, `/highlighthtmlpage ${game[game.turn].id}, Chess + ${room} + ${id}, Your turn!`);
			}, 1000);
			break;
		}
		case 3: {
			// Checkmate
			let moves = Array.from(game.moves);
			game.result = game.turn == 'B' ? '1-0' : '0-1';
			if (!moves) moves = [];
			const W = game.W.name, B = game.B.name, pgn = CHESS.toPGN(game);
			// UGOCODE
			/*
			if (UGOR(room)) {
				const played = Number(Bot.UGO.get(game.turn === 'B' ? game.W.id : game.B.id)?.[gameName]);
				if (played <= pointsLimit) awardUGOPoints(pointsWin, [toID(game.turn === 'B' ? W : B)]);
				awardUGOPoints(pointsLose, [game[game.turn].id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
			}
			*/
			// ENDUGOCODE
			fs.unlink(`./data/BACKUPS/chess-${room}-${id}.json`, e => {});
			game.switchSides();
			Bot.say(room, `/adduhtml CHESS-${Date.now()},<center>${game.boardHTML(game.turn)}</center>`);
			game.spectatorSend(`<center><h1>Checkmate!</h1>${game.boardHTML()}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.W.id}, Chess + ${room} + ${id}, <center><h1>Checkmate!</h1>${game.boardHTML('W')}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Chess + ${room} + ${id}, <center><h1>Checkmate!</h1>${game.boardHTML('B')}</center>`);
			Bot.say(room, `${game.result === '1-0' ? W : B} won by checkmate! Game ended!`);
			delete Bot.rooms[room].chess[id];
			sendEmbed(room, W, B, pgn);
			return;
			break;
		}
		case 4: {
			// Stalemate
			let moves = Array.from(game.moves);
			game.result = '1/2-1/2';
			if (!moves) moves = [];
			moves.push('END');
			const W = game.W.name, B = game.B.name, pgn = CHESS.toPGN(game);
			// UGOCODE
			/*
			if (UGOR(room)) {
				awardUGOPoints(pointsDraw, [game.W.id, game.B.id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
			}
			*/
			// ENDUGOCODE
			fs.unlink(`./data/BACKUPS/chess-${room}-${id}.json`, e => {});
			Bot.say(room, `/adduhtml CHESS-${Date.now()},<center>${game.boardHTML(game.turn)}</center>`);
			game.spectatorSend(`<center><h1>Stalemate</h1>${game.boardHTML()}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.W.id}, Chess + ${room} + ${id}, <center><h1>Stalemate</h1>${game.boardHTML('W')}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Chess + ${room} + ${id}, <center><h1>Stalemate</h1>${game.boardHTML('B')}</center>`);
			Bot.say(room, 'Stalemate! Game ended!');
			delete Bot.rooms[room].chess[id];
			sendEmbed(room, W, B, pgn);
			return;
			break;
		}
		case 'end': {
			let moves = Array.from(game.moves);
			if (info) game.result = info === 'W' ? '1-0' : '0-1';
			else game.result = '1/2-1/2';
			if (!moves) moves = [];
			moves.push('END');
			const W = game.W.name, B = game.B.name, pgn = CHESS.toPGN(game);
			// UGOCODE
			/*
			if (info !== null) {
				if (UGOR(room)) {
					if (game[info]) {
						const played = Number(Bot.UGO.get(game[info].id)?.[gameName]);
						if (played <= pointsLimit) awardUGOPoints(pointsWin, [toID(game[info].id)]);
						awardUGOPoints(pointsLose, [game[info === 'W' ? 'B' : 'W'].id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
					} else {
						awardUGOPoints(pointsDraw, [game.W.id, game.B.id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
					}
				}
			}
			*/
			// ENDUGOCODE
			fs.unlink(`./data/BACKUPS/chess-${room}-${id}.json`, e => {});
			Bot.say(room, `/adduhtml CHESS-${Date.now()},<center>${game.boardHTML(game.turn)}</center>`);
			game.spectatorSend(`<center><h1>Game Ended.</h1>${game.boardHTML()}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.W.id}, Chess + ${room} + ${id}, <center><h1>Game Ended.</h1>${game.boardHTML('W')}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Chess + ${room} + ${id}, <center><h1>Game Ended.</h1>${game.boardHTML('B')}</center>`);
			Bot.say(room, 'Game ended!');
			delete Bot.rooms[room].chess[id];
			setTimeout(() => sendEmbed(room, W, B, pgn), 1000);
			return;
			break;
		}
		case 'resign': {
			const side = info;
			game.spectatorSend(`<center><h1>Resigned.</h1>${game.boardHTML()}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.W.id}, Chess + ${room} + ${id}, <center><h1>Resigned.</h1>${game.boardHTML('W')}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Chess + ${room} + ${id}, <center><h1>Resigned.</h1>${game.boardHTML('B')}</center>`);
			Bot.say(room, `/adduhtml CHESS-${Date.now()},<center>${game.boardHTML()}</center>`);
			let moves = Array.from(game.moves);
			game.result = side === "B" ? '1-0' : '0-1';
			if (!moves) moves = [];
			moves.push("RESIGN");
			const W = game.W.name, B = game.B.name, pgn = CHESS.toPGN(game);
			// UGOCODE
			/*
			if (UGOR(room)) {
				const played = Number(Bot.UGO.get(game[side === 'W' ? 'B' : 'W'].id)?.[gameName]);
				if (played <= pointsLimit) awardUGOPoints(pointsWin, [game[side === 'W' ? 'B' : 'W'].id]);
				awardUGOPoints(pointsLose, [game[side].id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
			}
			*/
			// ENDUGOCODE
			delete Bot.rooms[room].chess[id];
			fs.unlink(`./data/BACKUPS/chess-${room}-${id}.json`, e => {});
			Bot.say(room, 'Game ended!');
			sendEmbed(room, W, B, pgn);
			return;
			break;
		}
		default: return Bot.roomReply(room, game[game.turn].id, info);
	}
	fs.writeFile(`./data/BACKUPS/chess-${room}-${id}.json`, JSON.stringify(game), e => {
		if (e) console.log(e);
	});
}

module.exports = {
	help: `Chess. https://www.instructables.com/Playing-Chess/`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client, isPM) {
		if (!args[0]) args.push('help');
		switch (args[0].toLowerCase()) {
			case 'help': case 'h': {
				if (tools.hasPermission(by, 'gamma', room) && !isPM) return Bot.say(room, this.help);
				else Bot.roomReply(room, by, this.help);
				break;
			}
			case 'new': case 'n': case 'n.n': case 'nwn': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (isPM) return Bot.roomReply(room, by, "This command is only usable in the chatroom.");
				if (!tools.canHTML(room)) return Bot.say(room, 'I can\'t do that here. Ask an RO to promote me or something.');
				if (!Bot.rooms[room].chess) Bot.rooms[room].chess = {};
				const id = Date.now();
				Bot.rooms[room].chess[id] = GAMES.create('chess', id, room);
				Bot.say(room, `/adduhtml CHESS-${id}, <hr/><h1>Chess Signups have begun!</h1><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room}, join ${id} White">White</button><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room}, join ${id} Black">Black</button><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room}, join ${id} Random">Random</button><hr/>`);
				Bot.say(room, '/notifyrank all, Chess, A new game of chess has been created!,chesssignup');
				return;
				break;
			}
			case 'join': case 'j': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'There isn\'t an active chess game in this room.');
				if (!args[1]) return Bot.roomReply(room, by, 'Please specify the ID / side.');
				let id, side, user = toID(by), rand = false;
				if (args[2] && parseInt(args[1])) {
					id = args[1];
					side = args[2][0].toUpperCase();
					if (side === 'R') {
						side = ['W', 'B'].random();
						rand = true;
					}
					if (!["W", "B"].includes(side)) return Bot.roomReply(room, by, "I only accept white and black. (insert snarky comment)");
				} else if (Object.keys(Bot.rooms[room].chess).length === 1) {
					id = Object.keys(Bot.rooms[room].chess)[0];
					side = args[1][0].toUpperCase();
					if (side === 'R') {
						side = ['W', 'B'].random();
						rand = true;
					}
					if (!["W", "B"].includes(side)) return Bot.roomReply(room, by, "I only accept white and black. (insert snarky comment)");
				} else {
					side = args[1][0].toUpperCase();
					if (side === 'R') {
						side = ['W', 'B'].random();
						rand = true;
					}
					if (!["W", "B"].includes(side)) return Bot.roomReply(room, by, "I only accept white and black. (insert snarky comment)");
					id = Object.keys(Bot.rooms[room].chess).find(k => {
						const game = Bot.rooms[room].chess[k];
						return game && !game.started && !game[side].id;
					});
					if (!id) return Bot.roomReply(room, by, "Sorry, unable to find any open games.");
				}
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Nope. BOOP");
				if (game.started) return Bot.roomReply(room, by, 'Too late!');
				if (game[side].id) return Bot.roomReply(room, by, "Sorry, already taken!");
				const other = side === 'W' ? 'B' : 'W';
				if (game[other].id === user) return Bot.roomReply(room, by, "~~You couldn't find anyone else to fight you? __Really__?~~");
				// UGOCODE
				/*
				if (UGOR(room)) {
					const userGames = Bot.UGO.object()[user];
					const played = Number(userGames?.[gameName]) || 0;
					if (played >= gameLimit) return Bot.roomReply(room, by, `You have already played ${played} games of ${gameTitle} today and reached the maximum! The count resets at midnight UTC every day.`);
					if (played >= pointsLimit) Bot.roomReply(room, by, `You have already played ${played} games of ${gameTitle} today! While you can still continue to play, UGO points will not be counted for this and future games. The count resets at midnight UTC every day.`);
					if (!userGames) {
						const points = {};
						points[gameName] = 1;
						Bot.UGO.set(user, points);
					} else {
						userGames[gameName] = played + 1;
						Bot.UGO.save();
					}
				}
				*/
				// ENDUGOCODE
				Bot.say(room, `${by.substr(1)} joined Chess (#${id}) as ${side === 'W' ? 'White' : 'Black'}!${rand ? ' (random)' : ''}`);
				runMoves('join', { user: by.substr(1), side: side }, game);
				break;
			}
			case 'play': case 'move': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'There isn\'t an active chess game in this room.');
				if (!args[1]) return Bot.roomReply(room, by, unxa);
				args.shift();
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				let id, user = toID(by);
				if (args[1]) id = args.shift().trim();
				else id = Object.keys(Bot.rooms[room].chess).find(k => {
					const game = Bot.rooms[room].chess[k];
					return game && game.started && !game[game.turn].id === user;
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (!game.started) return Bot.roomReply(room, by, 'OI, IT HASN\'T STARTED!');
				if (!(game[game.turn].id === toID(by))) return;
				const squares = args.join('').toLowerCase().split('-');
				delete game.W.isResigning;
				delete game.B.isResigning;
				delete game.W.wtd;
				delete game.B.wtd;
				game.play(game.turn, squares[0], squares[1], (run, info) => runMoves(run, info, game));
				break;
			}
			case 'premove': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'There isn\'t an active chess game in this room.');
				if (!args[1]) return Bot.roomReply(room, by, unxa);
				args.shift();
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				let id, user = toID(by);
				if (args[1]) id = args.shift().trim();
				else id = Object.keys(Bot.rooms[room].chess).find(k => {
					const game = Bot.rooms[room].chess[k];
					return game && game.started && !game[game.turn].id === user;
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (!game.started) return Bot.roomReply(room, by, 'OI, IT HASN\'T STARTED!');
				const opp = game.turn === 'W' ? 'B' : 'W';
				if (!(game[opp].id === toID(by))) return;
				const squares = args.join('').toLowerCase().split('-');
				if (squares.length !== 2) return Bot.roomReply(room, by, `OMA A ${squares.length}-SQUARE PREMOVE! OUTSTANDING!`);
				game[opp].preMove = [squares[0], squares[1]];
				Bot.say(room, `/sendhtmlpage ${by}, Chess + ${room} + ${id}, <h1 style=\"text-align: center;\">Waiting for opponent...</h1><center>${game.boardHTML(opp)}</center>`);
				break;
			}
			case 'select': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				if (!args[1]) return Bot.roomReply(room, by, unxa);
				args.shift();
				let id, user = toID(by);
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				if (args[1]) id = args.shift().trim();
				else id = Object.keys(Bot.rooms[room].chess).find(k => {
					const game = Bot.rooms[room].chess[k];
					return game && game.started && !game[game.turn].id === user;
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Didn't find it.");
				if (!game.started) return Bot.roomReply(room, by, 'Let it start, nerd.');
				const square = args.join('').toLowerCase(), side = game.W.id === user ? 'W' : 'B';
				if (game[side].id !== user) return;
				const text = `<center>${game.boardHTML(side, square, game[game.turn].id === toID(by) ? game.getValidMoves(square, null) : game.getSquares(square, null, true))}</center>`;
				if (!text) return;
				Bot.say(room, `/sendhtmlpage ${by}, Chess + ${room} + ${id}, ${game.turn === side ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}${text}`);
				break;
			}
			case 'deselect': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				args.shift();
				let id, user = toID(by);
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length) id = args.shift().trim();
				else id = Object.keys(Bot.rooms[room].chess).find(k => {
					const game = Bot.rooms[room].chess[k];
					return game && game.started && !game[game.turn].id === user;
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].chess[id];
				if (!game.started) return Bot.roomReply(room, by, 'Let it start, nerd.');
				if (!(game[game.turn].id === toID(by))) return;
				return Bot.say(room, `/sendhtmlpage ${game[game.turn].id}, Chess + ${room} + ${id}, ${true ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(game.turn)}</center>`);
				break;
			}
			case 'promote': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				args.shift();
				if (!args[1]) return Bot.roomReply(room, by, unxa);
				let id, user = toID(by);
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				if (args[2]) id = args.shift().trim();
				else id = Object.keys(Bot.rooms[room].chess).find(k => {
					const game = Bot.rooms[room].chess[k];
					return game && game.started && !game[game.turn].id === user;
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].chess[id];
				if (!game.started) return Bot.roomReply(room, by, 'Let it start, nerd.');
				if (!(game[game.turn].id === toID(by))) return;
				args = args.map(arg => arg.toLowerCase().trim());
				if (!/^[a-h][1-8]$/.test(args[0])) return Bot.roomReply(room, by, 'Invalid square! (You shouldn\'t be seeing this if you used the buttons)');
				let piece;
				switch (args[1]) {
					case 'knight': case 'n': piece = 'N'; break;
					case 'bishop': case 'b': piece = 'B'; break;
					case 'rook': case 'r': piece = 'R'; break;
					case 'queen': case 'q': piece = 'Q'; break;
					default: break;
				}
				if (!piece) return Bot.roomReply(room, by, 'Invalid piece!');
				if (!game[game.turn].isPromoting) return Bot.roomReply(room, by, `You're not promoting anything.`);
				game.promote(piece, args[0], game.turn, (run, info) => runMoves(run, info, game));
				break;
			}
			case 'substitute': case 'sub': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				args.shift();
				let id, cargs;
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				if (/^[^a-zA-Z]+$/.test(args[0])) id = toID(args.shift());
				else if (Object.keys(Bot.rooms[room].chess).length === 1) id = Object.keys(Bot.rooms[room].chess)[0];
				else {
					cargs = args.join(' ').split(/\s*,\s*/);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "I NEED TWO NAMES GIVE ME TWO NAMES");
					const id1 = toID(cargs[0]), id2 = toID(cargs[1]);
					id = Object.keys(Bot.rooms[room].chess).find(k => {
						const game = Bot.rooms[room].chess[k], ps = [game.W.id, game.B.id];
						return game && game.started && (ps.includes(id1) && !ps.includes(id2) || !ps.includes(id1) && ps.includes(id2));
					});
				}
				cargs = args.join(' ').replace(/[<>]/g, '').split(/\s*,\s*/);
				if (cargs.length !== 2) return Bot.roomReply(room, by, "I NEED TWO NAMES GIVE ME TWO NAMES");
				if (!id) return Bot.roomReply(room, by, "Sorry, I couldn't find a valid game to sub.");
				const game = Bot.rooms[room].chess[id];
				if (!game.started) return Bot.roomReply(room, by, 'Excuse me?');
				cargs = cargs.map(carg => carg.trim());
				const users = cargs.map(carg => toID(carg));
				if (users.includes(game.W.id) && users.includes(game.B.id) || !users.includes(game.W.id) && !users.includes(game.B.id)) return Bot.say(room, 'Those users? Something\'s wrong with those...');
				if ([game.W.id, game.B.id].includes(toID(by)) && !tools.hasPermission(by, 'coder')) return Bot.say(room, "Hah! Can't sub yourself out."); // UGOCODE beta -> coder
				// UGOCODE
				/*
				if (UGOR(room)) {
					const coming = users.find(u => ![game.W.id, game.B.id].includes(u)), going = users.find(u => [game.W.id, game.B.id].includes(u));
					const user = coming;
					const userGames = Bot.UGO.object()[user];
					const played = Number(userGames?.[gameName]) || 0;
					if (played >= gameLimit) return Bot.say(room, `[[ ]]${user} has already played ${played} games of ${gameTitle} today and reached the maximum! The count resets at midnight UTC every day.`)
					if (played >= pointsLimit) Bot.roomReply(room, by, `You have already played ${played} games of ${gameTitle} today! While you can still continue to play, UGO points will not be counted for this and future games. The count resets at midnight UTC every day.`);
					if (!userGames) {
						const points = {};
						points[gameName] = 1;
						Bot.UGO.set(user, points);
					} else {
						userGames[gameName] = played + 1;
						Bot.UGO.save();
					}
					const lusers = [going];
					const UGODB = Bot.UGO.object();
					lusers.forEach(u => {
						u = toID(u);
						const userGames = (UGODB[u] || {});
						userGames[gameName] = userGames[gameName] ? userGames[gameName] - 1 : 0;
					});
					Bot.UGO.save();
				}
				*/
				// ENDUGOCODE
				let ex, add;
				if (users.includes(game.W.id)) {
					if (users[0] == game.W.id) {
						Bot.say(room, `${game.W.name} was subbed with ${cargs[1]}!`);
						game.W.id = users[1];
						game.W.name = cargs[1];
						ex = users[0];
						add = users[1];
					} else {
						Bot.say(room, `${game.W.name} was subbed with ${cargs[0]}!`);
						game.W.id = users[0];
						game.W.name = cargs[0];
						ex = users[1];
						add = users[0];
					}
				} else {
					if (users[0] == game.B.id) {
						Bot.say(room, `${game.B.name} was subbed with ${cargs[1]}!`);
						game.B.id = users[1];
						game.B.name = cargs[1];
						ex = users[0];
						add = users[1];
					} else {
						Bot.say(room, `${game.B.name} was subbed with ${cargs[0]}!`);
						game.B.id = users[0];
						game.B.name = cargs[0];
						ex = users[1];
						add = users[0];
					}
				}
				delete game.spectators[add];
				// game.spectators.push(ex); // Alt changing messes this up
				runMoves(1, null, game);
				break;
			}
			case 'end': case 'e': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				args.shift();
				let id;
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].chess).length === 1) id = Object.keys(Bot.rooms[room].chess)[0];
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, unxa);
					id = Object.keys(Bot.rooms[room].chess).find(k => {
						const game = Bot.rooms[room].chess[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id)) return true;
					});
				}
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				if (!game.started) {
					// UGOCODE
					/*
					if (UGOR(room)) {
						const users = [game.W.id, game.B.id].filter(t => t);
						const UGODB = Bot.UGO.object();
						users.forEach(u => {
							u = toID(u);
							const userGames = (UGODB[u] || {});
							userGames[gameName] = userGames[gameName] ? userGames[gameName] - 1 : 0;
						});
						Bot.UGO.save();
					}
					*/
					// ENDUGOCODE
					delete Bot.rooms[room].chess[id];
					Bot.say(room, `/changeuhtml CHESS-${id}, Ended. :(`);
					return Bot.say(room, `Welp, ended Chess#${id}.`);
				}
				runMoves('end', null, game);
				break;
			}
			case 'endf': case 'ef': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				args.shift();
				const [id, winner] = args.join('').split(',').map(toID);
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				if (winner !== 'none' && ![game.W.id, game.B.id].includes(winner)) return Bot.roomReply(room, by, `${winner} was not a valid winner (name or 'none')`);
				if (!game.started) {
					// UGOCODE
					/*
					if (UGOR(room)) {
						const users = [game.W.id, game.B.id].filter(t => t);
						const UGODB = Bot.UGO.object();
						users.forEach(u => {
							u = toID(u);
							const userGames = (UGODB[u] || {});
							userGames[gameName] = userGames[gameName] ? userGames[gameName] - 1 : 0;
						});
						Bot.UGO.save();
					}
					*/
					// ENDUGOCODE
					delete Bot.rooms[room].chess[id];
					Bot.say(room, `/changeuhtml CHESS-${id}, Ended. :(`);
					return Bot.say(room, `Welp, ended Chess#${id}.`);
				}
				if (toID(by) === winner) return Bot.roomReply(room, by, 'Only I may be corrupt');
				runMoves('end', winner === 'none' ? 'none' : game.W.id === winner ? 'W' : 'B', game);
				break;
			}
			case 'endsilent': case 'es': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				args.shift();
				let id;
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].chess).length === 1) id = Object.keys(Bot.rooms[room].chess)[0];
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, unxa);
					id = Object.keys(Bot.rooms[room].chess).find(k => {
						const game = Bot.rooms[room].chess[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id)) return true;
					});
				}
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				if (!game.started) {
					delete Bot.rooms[room].chess[id];
					return Bot.say(room, `Welp, ended Chess#${id}.`);
				}
				break;
			}
			case 'backups': case 'bu': case 'stashed': case 'b': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, "Access denied.");
				fs.readdir('./data/BACKUPS', (err, files) => {
					if (err) {
						Bot.say(room, err);
						return Bot.log(err);
					}
					const games = files.filter(file => file.startsWith(`chess-${room}-`)).map(file => file.slice(0, -4)).map(file => file.replace(/[^0-9]/g, ''));
					if (games.length) {
						Bot.say(room, `/adduhtml CHESSBACKUPS, <details><summary>Game Backups</summary><hr />${games.map(game => {
							try {
								const info = require(`../../data/BACKUPS/chess-${room}-${game}.json`);
								return `<button name="send" value="/botmsg ${Bot.status.nickName},${prefix}chess ${room} restore ${game}">${info.W.name} vs ${info.B.name}</button>`;
							} catch {
								return null;
							}
						}).filter(Boolean).join('<br/>')}</details>`);
					} else Bot.say(room, "No backups found.");
				});
				break;
			}
			case 'restore': case 'resume': case 'r': {
				args.shift();
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, "Access denied.");
				const id = parseInt(args.join(''));
				if (!id) return Bot.roomReply(room, by, "Invalid ID.");
				if (Bot.rooms[room].chess?.[id]) return Bot.roomReply(room, by, "Sorry, that game is already in progress!");
				fs.readFile(`./data/BACKUPS/chess-${room}-${id}.json`, 'utf8', (err, file) => {
					if (err) return Bot.roomReply(room, by, "Sorry, couldn't find that game!");
					if (!Bot.rooms[room].chess) Bot.rooms[room].chess = {};
					Bot.rooms[room].chess[id] = GAMES.create('chess', id, room, JSON.parse(file));
					const game = Bot.rooms[room].chess[id];
					Bot.say(room, `The game between ${game.W.name} and ${game.B.name} has been restored!`);
					game.spectatorSend(`<center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`);
					Bot.say(room, `/sendhtmlpage ${game.W.id}, Chess + ${room} + ${id}, ${game.turn === "W" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML('W')}</center>`);
					Bot.say(room, `/sendhtmlpage ${game.B.id}, Chess + ${room} + ${id}, ${game.turn === "B" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML('B')}</center>`);
				});
				return;
				break;
			}
			case 'board': case 'b': case 'theme': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				if (!tools.hasPermission(by, 'beta', room)) if (by.startsWith(' ')) return Bot.roomReply(room, by, 'Access denied.');
				args.shift();
				let id;
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length && /^[^a-zA-Z]+$/.test(args[0])) id = toID(args.shift());
				else if (Object.keys(Bot.rooms[room].chess).length === 1) id = Object.keys(Bot.rooms[room].chess)[0];
				else if (Object.values(Bot.rooms[room].chess).filter(game => game.W.id && game.B.id).length === 1) id = Object.values(Bot.rooms[room].chess).filter(game => game.W.id && game.B.id)[0].id;
				else {
					const cargs = args.join(' ').split(/,/)[0].split(/(?:\/|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, unxa);
					id = Object.keys(Bot.rooms[room].chess).find(k => {
						const game = Bot.rooms[room].chess[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id)) return true;
					});
				}
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].chess[id], cs = game.colours;
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				let cargs = args.join(' ').split(/,/), given = toID(cargs.pop());
				const aliases = {
					"normal": "default",
					"original": "default",
					"emerald": "green",
					"snow": "pristine",
					"seafloor": "ocean",
					"midnight": "spooky",
					"halloween": "spooky",
					"ii88": "ii",
					"ugo": "ii",
					"candyland": "ii"
				};
				given = aliases[given] || given;
				const colourSRC = JSON.parse(fs.readFileSync('./data/DATA/chess_themes.json', 'utf8'))[given];
				if (!colourSRC) return Bot.roomReply(room, by, "Sorry, didn't find that theme!");
				game.colours = colourSRC;
				runMoves(1, null, game);
				return;
				break;
			}
			case 'emote': case 'emoticon': case 'emo': case 'unicode': case 'ascii': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				args.shift();
				let id;
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length && /^[^a-zA-Z]+$/.test(args[0])) id = toID(args.shift());
				else if (Object.keys(Bot.rooms[room].chess).length === 1) id = Object.keys(Bot.rooms[room].chess)[0];
				else if (Object.values(Bot.rooms[room].chess).filter(game => game.W.id && game.B.id).length === 1) id = Object.values(Bot.rooms[room].chess).filter(game => game.W.id && game.B.id)[0].id;
				else {
					const cargs = args.join(' ').split(/,/)[0].split(/(?:\/|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, unxa);
					id = Object.keys(Bot.rooms[room].chess).find(k => {
						const game = Bot.rooms[room].chess[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id)) return true;
					});
				}
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				game.useEmo = !game.useEmo;
				runMoves(1, null, game);
				return;
				break;
			}
			case 'menu': case 'm': case 'list': case 'l': case 'players': {
				const chess = Bot.rooms[room].chess;
				if (!chess || !Object.keys(chess).length) {
					if (tools.hasPermission(by, 'gamma', room) && !isPM) return Bot.say(room, "Sorry, no games found.");
					return Bot.roomReply(room, by, "Sorry, no games found.");
				}
				const html = `<hr />${Object.keys(chess).map(id => {
					const game = chess[id];
					return `${game.W.name ? tools.colourize(game.W.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} join ${id} White">White</button>`} vs ${game.B.name ? tools.colourize(game.B.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} join ${id} Black">Black</button>`} ${game.started ? `<button name="send" value ="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} spectate ${id}">Watch</button> ` : ''}(#${id})`;
				}).join('<br/>')}<hr />`;
				const staffHTML = `<hr />${Object.keys(chess).map(id => {
					const game = chess[id];
					return `${game.W.name ? tools.colourize(game.W.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} join ${id} White">White</button>`} vs ${game.B.name ? tools.colourize(game.B.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} join ${id} Black">Black</button>`} ${game.started ? `<button name="send" value ="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} spectate ${id}">Watch</button> ` : ''}${tools.hasPermission(by, 'gamma', room) ? `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} end ${id}">End</button> <button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}chess ${room} stash ${id}">Stash</button>` : ''}(#${id})`;
				}).join('<br/>')}<hr />`;
				if (isPM === 'export') return [html, staffHTML];
				if (tools.hasPermission(by, 'gamma', room) && !isPM) {
					Bot.say(room, `/adduhtml CHESSMENU,${html}`);
					Bot.say(room, `/changerankuhtml +, CHESSMENU, ${staffHTML}`);
				} else Bot.say(room, `/sendprivatehtmlbox ${by}, ${html}`);
				break;
			}
			case 'resign': case 'forfeit': case 'f': case 'ff': case 'ihavebeenpwned': case 'bully': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'There isn\'t an active chess game in this room.');
				args.shift();
				let id, user = toID(by);
				if (args.length) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].chess).length === 1) id = Object.keys(Bot.rooms[room].chess)[0];
				else id = Object.keys(Bot.rooms[room].chess).find(k => {
					const game = Bot.rooms[room].chess[k];
					return game && game.started && [game.W.id, game.B.id].includes(user);
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to resign in.");
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (!game.started) return Bot.roomReply(room, by, '>resigning before it starts');
				if (![game.W.id, game.B.id].includes(user)) return Bot.roomReply(room, by, "Only a player can resign.");
				const side = game.W.id === user ? "W" : "B";
				if (!game[side].isResigning) {
					Bot.roomReply(room, by, 'Are you sure you want to resign? If you are, use this command again.');
					return game[side].isResigning = true;
				}
				runMoves('resign', side, game);
				break;
			}
			case 'offerdraw': case 'draw': case 'd': case 'offertie': case 'tie': case 'handshake': case 'accept': case 'acceptdraw': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'There isn\'t an active chess game in this room.');
				args.shift();
				let id, user = toID(by);
				if (args.length) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].chess).length === 1) id = Object.keys(Bot.rooms[room].chess)[0];
				else id = Object.keys(Bot.rooms[room].chess).find(k => {
					const game = Bot.rooms[room].chess[k];
					return game && game.started && [game.W.id, game.B.id].includes(user);
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant.");
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (!game.started) return Bot.roomReply(room, by, '>drawing before it starts');
				if (![game.W.id, game.B.id].includes(user)) return Bot.roomReply(room, by, "Only a player can draw.");
				const side = game.W.id === user ? "W" : "B";
				const otherSide = side === "W" ? "B" : "W";
				const offered = game[otherSide].wtd;
				const enemy = game[otherSide].name, already = !game[side].wtd;
				if (offered) runMoves("end", false, game);
				else game[side].wtd = true;
				if (already) Bot.say(room, `${by.substr(1)} has ${offered ? 'accepted the' : 'sent a'} draw offer${offered ? '.' : `! ${enemy}, use \`\`${prefix}chess acceptdraw ${id}\`\` to acccept, or keep playing to decline.`}`);
				break;
			}
			case 'challenge': {
				return Bot.roomReply(room, by, "Sorry, this feature has been disabled until PartMan rewrites it properly.");
				if (room.startsWith('groupchat-')) return Bot.roomReply(room, by, "You can't challenge someone in a groupchat, sorry...");
				if (!tools.canHTML(room)) return Bot.say(room, 'Sorry, I lack the permissions to do that here...');
				if (!args.length) return Bot.roomReply(room, by, 'Who do you want to challenge?');
				if (Bot.rooms[`groupchat-${room}-${toID(by)}`]) return Bot.roomReply(room, by, 'You can only challenge one person at a time.');
				args.shift();
				if (!Bot.rooms[room].users.includes(toID(args.join('')))) return Bot.say(room, "I can't find that user...");
				if (toID(args.join('')) == toID(Bot.status.nickName)) return Bot.roomReply(room, by, 'Seriously? Me?');
				if (!Bot.rooms[room].pendingChessChallenges) Bot.rooms[room].pendingChessChallenges = {};
				Bot.rooms[room].pendingChessChallenges[toID(args.join(''))] = toID(by);
				Bot.say(room, `/subroomgroupchat ${by.substr(1)}`);
				const gc = `groupchat-${room}-${toID(by)}`;
				Bot.say(room, `${by.substr(1)} has challenged ${args.join(' ')} to a match of chess! <<${gc}>>`);
				Bot.say(gc, `/roomvoice ${by}\n/roomvoice ${args.join(' ')}`);
				Bot.say(gc, '/modchat +');
				if (!Bot.chessGroupchats) Bot.chessGroupchats = [];
				Bot.chessGroupchats.push(gc);
				break;
			}
			case 'spectate': case 's': case 'watch': case 'w': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				args.shift();
				let id;
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].chess).length === 1) id = Object.keys(Bot.rooms[room].chess)[0];
				else if (Object.values(Bot.rooms[room].chess).filter(game => game.started).length === 1) id = Object.values(Bot.rooms[room].chess).filter(game => game.started)[0].id;
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "Sorry, specify the players again?");
					id = Object.keys(Bot.rooms[room].chess).find(k => {
						const game = Bot.rooms[room].chess[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id) && !game.spectators[toID(by)]) return true;
					});
				}
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Sorry, no chess game here to spectate.");
				if (!game.started) Bot.roomReply(room, by, "Oki, I'll send you the board when it starts.");
				const user = toID(by);
				if (game.spectators[user]) return Bot.roomReply(room, by, `You're already spectating! If you want to stop, use \`\`${prefix}chess unspectate\`\` instead!`);
				if ([game.W.id, game.B.id].includes(user)) return Bot.roomReply(room, by, "Imagine spectating your own game.");
				game.spectators[user] = 'W';
				Bot.say(room, `/sendhtmlpage ${by}, Chess + ${room} + ${id}, <center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML(null, null, null, game.spectators[user])}</center>`);
				return Bot.roomReply(room, by, `You are now spectating the chess match between ${game.W.name} and ${game.B.name}!`);
				break;
			}
			case 'unspectate': case 'us': case 'unwatch': case 'uw': case 'zestoflifeisstinky': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				args.shift();
				let id;
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.values(Bot.rooms[room].chess).filter(game => game.spectators[toID(by)]).length === 1) id = Object.values(Bot.rooms[room].chess).filter(game => game.spectators[toID(by)])[0].id;
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "Sorry, didn't get the game you meant.");
					id = Object.keys(Bot.rooms[room].chess).find(k => {
						const game = Bot.rooms[room].chess[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id) && game.spectators[toID(by)]) return true;
					});
				}
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Sorry, no chess game here to unspectate.");
				if (!game.started) return Bot.roomReply(room, by, "AYAYAYA - no.");
				const user = toID(by);
				if ([game.W.id, game.B.id].includes(user)) return Bot.roomReply(room, by, "Imagine unspectating your own game.");
				if (!game.spectators[user]) return Bot.roomReply(room, by, `You aren't spectating! If you want to, use \`\`${prefix}chess spectate\`\` instead!`);
				delete game.spectators[user];
				return Bot.roomReply(room, by, `You are no longer spectating the chess match between ${game.W.name} and ${game.B.name}.`);
				break;
			}
			case 'flip': case 'flipboard': case 'switch': case 'switchsides': case 'rotate': {
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any chess games.');
				args.shift();
				let id;
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.values(Bot.rooms[room].chess).filter(game => game.spectators[toID(by)]).length === 1) id = Object.values(Bot.rooms[room].chess).filter(game => game.spectators[toID(by)])[0].id;
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "Sorry, didn't get the game you meant.");
					id = Object.keys(Bot.rooms[room].chess).find(k => {
						const game = Bot.rooms[room].chess[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id) && game.spectators[toID(by)]) return true;
					});
				}
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Sorry, no chess game here to flip.");
				if (!game.started) return Bot.roomReply(room, by, "AYAYAYA - no.");
				const user = toID(by);
				if ([game.W.id, game.B.id].includes(user)) return Bot.roomReply(room, by, "Imagine trying to play as the opponent.");
				if (!game.spectators[user]) return Bot.roomReply(room, by, `You aren't spectating! If you want to, use \`\`${prefix}chess spectate\`\` first!`);
				game.spectators[user] = game.spectators[user] === 'W' ? 'B' : 'W';
				Bot.roomReply(room, by, "Flipped le board!");
				break;
			}
			case 'rejoin': case 'rj': {
				const games = Bot.rooms[room].chess;
				if (!games) return Bot.roomReply(room, by, "Sorry, no chess game here to spectate.");
				const user = toID(by);
				const ids = Object.keys(games).filter(key => [games[key].W.id, games[key].B.id, ...Object.keys(games[key].spectators)].includes(user));
				if (!ids.length) return Bot.roomReply(room, by, "Couldn't find any games for you to rejoin.");
				ids.forEach(id => {
					let game = games[id], side;
					if (game.W.id === user) side = "W";
					if (game.B.id === user) side = "B";
					if (!game.started) return;
					if (!side && !game.spectators[user]) return Bot.roomReply(room, by, `You don't look like a player / spectator - try ${prefix}chess spectate ${id}... ;-;`);
					if (game.spectators[user]) Bot.say(room, `/sendhtmlpage ${by}, Chess + ${room} + ${id}, <center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML(null, null, null, game.spectators[user])}</center>`);
					else Bot.say(room, `/sendhtmlpage ${user}, Chess + ${room} + ${id}, ${game.turn === side ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(side)}</center>`);
				});
				break;
			}
			case 'stash': case 'store': case 'freeze': case 'hold': case 'h': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].chess) return Bot.roomReply(room, by, 'This room does not have any Chess games.');
				args.shift();
				let id;
				if (!Object.keys(Bot.rooms[room].chess).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].chess).length === 1) id = Object.keys(Bot.rooms[room].chess)[0];
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, unxa);
					id = Object.keys(Bot.rooms[room].chess).find(k => {
						const game = Bot.rooms[room].chess[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id)) return true;
					});
				}
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].chess[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				Bot.say(room, `The Chess match between ${game.W.name} and ${game.B.name} has been put on hold!`);
				delete Bot.rooms[room].chess[id];
				break;
			}
			case 'themepreview': case 'preview': case 'tp': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, "Access denied.");
				args.shift();
				if (!args.length) return Bot.roomReply(room, by, unxa);
				if (args.length === 1) args.unshift('white');
				args = args.map(col => col.replace(/[^a-zA-Z0-9#,\(\)\.]/g, ''));
				const cs = {};
				['W', 'B', 'sel', 'hl', 'last'].forEach((term, index) => {
					let def;
					if (term === 'sel') def = '#87CEFA';
					if (term === 'hl') def = 'rgba(173, 255, 47, 0.9)';
					if (term === 'last') def = 'rgba(255, 51, 0, 0.1)';
					cs[term] = args[index] || (def || null);
				});
				let html = `<center><table style="text-align: center; border-collapse:collapse;" border="1"><tr style="text-align: center; height: 15;"><th width="15" height="15"></th><th width="40">A</th><th width="40">B</th><th width="40">C</th><th width="40">D</th><th width="40">E</th><th width="40">F</th><th width="40">G</th><th width="40">H</th><th width="15"></th></tr><tr style="text-align: center; height: 40;"><td height="40"><b><center>8</center></b></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BR.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BN.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BB.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BQ.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BK.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BB.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BN.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BR.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><th>8</th></tr><tr style="text-align: center; height: 40;"><td height="40"><b><center>7</center></b></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><th>7</th></tr><tr style="text-align: center; height: 40;"><td height="40"><b><center>6</center></b></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><th>6</th></tr><tr style="text-align: center; height: 40;"><td height="40"><b><center>5</center></b></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><th>5</th></tr><tr style="text-align: center; height: 40;"><td height="40"><b><center>4</center></b></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LAST_LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><th>4</th></tr><tr style="text-align: center; height: 40;"><td height="40"><b><center>3</center></b></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: HL_LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LAST_DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: HL_LIGHT_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"></td><th>3</th></tr><tr style="text-align: center; height: 40;"><td height="40"><b><center>2</center></b></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: HL_DARK_SQUARE;" height="40" width="40"></td><td style="text-align: center; background: HL_LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/BP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WP.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><th>2</th></tr><tr style="text-align: center; height: 40;"><td height="40"><b><center>1</center></b></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WR.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WN.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WB.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: SELECTED_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WQ.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WK.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WB.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: DARK_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WN.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><td style="text-align: center; background: LIGHT_SQUARE;" height="40" width="40"><img src="http://51.79.52.188:8080/public/chess/WR.png" height="25" width="25" style="text-align: center; height: 25; width: 25" /></td><th>1</th></tr><tr height="15"><th height="15"></th><th height="15">A</th><th height="15">B</th><th height="15">C</th><th height="15">D</th><th height="15">E</th><th height="15">F</th><th height="15">G</th><th height="15">H</th><th height="15"></th></tr></table></center>`;
				html = html.replace(/LAST_LIGHT_SQUARE/g, `linear-gradient(${cs.last}, ${cs.last}), linear-gradient(${cs.W}, ${cs.W})`).replace(/LAST_DARK_SQUARE/g, `linear-gradient(${cs.last}, ${cs.last}), linear-gradient(${cs.B}, ${cs.B})`).replace(/HL_LIGHT_SQUARE/g, `linear-gradient(${cs.hl}, ${cs.hl}), linear-gradient(${cs.W}, ${cs.W})`).replace(/HL_DARK_SQUARE/g, `linear-gradient(${cs.hl}, ${cs.hl}), linear-gradient(${cs.B}, ${cs.B})`).replace(/LIGHT_SQUARE/g, cs.W).replace(/DARK_SQUARE/g, cs.B).replace(/SELECTED_SQUARE/g, cs.sel);
				Bot.say(room, `/adduhtml CHESS_PREVIEW, ${html}`);
				break;
			}
			case 'fen': case 'view': case 'v': case 'show': case 'display': case 'position': {
				if (!tools.hasPermission(by, 'beta', room) && (room !== 'boardgames' || !tools.hasPermission(by, 'gamma', room))) return Bot.roomReply(room, by, "Access denied.");
				if (!tools.canHTML(room)) return Bot.say(room, "Cannot post HTML here, sorry. 'o.o");
				args.shift();
				const CHESS = GAMES.get('chess');
				CHESS.FEN(args.join(' ')).then(inf => {
					const [board, side] = inf;
					const cache = {};
					cache.game = GAMES.create('chess', 0, room);
					cache.game.board = board;
					const html = cache.game.boardHTML('S', null, null, side);
					delete cache.game;
					Bot.say(room, `/adduhtml CHESS-FEN-${Date.now()}, <center>${html}</center>`);
				}).catch(err => {
					Bot.say(room, err.message);
					Bot.log(err);
				});
				break;
			}
			default: {
				Bot.roomReply(room, by, `That, uhh, doesn't seem to be something I recognize?`);
				break;
			}
		}
	}
};
