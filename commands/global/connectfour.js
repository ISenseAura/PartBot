// UGOCODE
/*
const gameLimit = 1000;
const pointsLimit = 20;
const gameName = 'connectfour';
const gameTitle = 'Connect Four';
const pointsWin = 8;
const pointsDraw = 6;
const pointsLose = 5;
*/

function gameTimer (game, turn) {
	const time = 45;
	if (!Bot.rooms[game.room]) return;
	if (!Bot.rooms[game.room].gameTimers) Bot.rooms[game.room].gameTimers = {};
	const gameTimers = Bot.rooms[game.room].gameTimers;
	clearTimeout(gameTimers[game.id]);
	gameTimers[game.id] = setTimeout(() => Bot.say(game.room, `${turn} hasn't played for the past ${time} seconds...`), time * 1000);
}

function clearGameTimer (game) {
	clearTimeout(Bot.rooms[game.room]?.gameTimers?.[game.id]);
}

function sendEmbed (room, winner, players, board, logs, rows) {
	Bot.say(room, `${websiteLink}/connectfour/${logs}`);
	if (!['boardgames'].includes(room)) return;
	board = Array.from({ length: board.length }).map((col, x) => Array.from({ length: rows }).map((_, y) => board[x][y] || 'E'));
	board.forEach(col => col.reverse());
	const Embed = require('discord.js').MessageEmbed, embed = new Embed();
	embed.setColor('#0080ff').setAuthor('Connect Four - Room Match').setTitle((winner === 'Y' ? `**${players.Y}**` : players.Y) + ' vs ' + (winner === 'R' ? `**${players.R}**` : players.R)).setURL(`${websiteLink}/connectfour/${logs}`).addField('\u200b', board[0].map((col, i) => board.map(row => row[i])).map(row => row.map(cell => {
		switch (cell) {
			case 'Y': {
				return ':yellow_circle:';
				break;
			}
			case 'R': {
				return ':red_circle:';
				break;
			}
			default: return ':blue_circle:';
		}
	}).join('')).join('\n'));
	client.channels.cache.get("576488243126599700").send(embed).catch(e => {
		Bot.say(room, 'Unable to send the game to the Discord because ' + e.message);
		Bot.log(e);
	});
}

function runMoves (run, info, game) {
	const room = game.room, id = game.id;
	switch (run) {
		case 'join': {
			const { user, side } = info;
			game[side].id = toID(user);
			game[side].name = user.replace(/[<>]/g, '');
			if (game.Y.id && game.R.id) return runMoves('start', null, game);
			const html = `<hr /><h1>Connect Four Signups are active!</h1>${["Y", "R"].filter(side => !game[side].id).map(side => `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}connectfour ${room}, join ${id} ${side === 'Y' ? 'Yellow' : 'Red'}">${side === 'Y' ? 'Yellow' : 'Red'}</button>`).join('&nbsp;')}<hr />`;
			return Bot.say(room, `/adduhtml CONNECTFOUR-${id}, ${html}`);
			break;
		}
		case 'start': {
			game.started = true;
			Bot.say(room, `Connect Four: ${game.Y.name} vs ${game.R.name} GOGO`);
			game.spectators.forEach(spect => Bot.sendHTML(spect, `<center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`));
			Bot.say(room, `/sendhtmlpage ${game.Y.id}, Connect Four + ${room} + ${id}, ${game.turn === "Y" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.R.id}, Connect Four + ${room} + ${id}, ${game.turn === "R" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
			setTimeout(() => {
				Bot.say(room, `/highlighthtmlpage ${game.Y.id}, Connect Four + ${room} + ${id}, Your turn!`);
			}, 1000);
			Bot.say(room, `/adduhtml CONNECTFOUR-${id},<hr />${tools.colourize(game.Y.name)} vs ${tools.colourize(game.R.name)}! <div style="text-align: right; display: inline-block; font-size: 0.9em; float: right;"><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}connectfour ${room} spectate ${id}">Watch!</button></div><hr />`);
			break;
		}
		case 'move': {
			game.spectators.forEach(spect => Bot.say(room, `/sendhtmlpage ${spect}, Connect Four + ${room} + ${id}, <center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`));
			Bot.say(room, `/sendhtmlpage ${game.Y.id}, Connect Four + ${room} + ${id}, ${game.turn === "Y" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.R.id}, Connect Four + ${room} + ${id}, ${game.turn === "R" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
			setTimeout(() => {
				Bot.say(room, `/highlighthtmlpage ${game[game.turn].id}, Connect Four + ${room} + ${id}, Your turn!`);
			}, 1000);
			break;
		}
		case 'end': {
			clearGameTimer(game);
			const players = { Y: game.Y.name, R: game.R.name }, board = game.board, logs = game.moves.join(''), winner = info, rows = game.rows;
			fs.unlink(`./data/BACKUPS/connectfour-${room}-${id}.json`, e => {});
			Bot.say(room, `/adduhtml CONNECTFOUR-${Date.now()},<center>${game.boardHTML(false, true)}</center>`);
			game.spectators.forEach(spect => Bot.say(room, `/sendhtmlpage ${spect}, Connect Four + ${room} + ${id}, <center><h1>Game over!</h1>${game.boardHTML(false)}</center>`));
			Bot.say(room, `/sendhtmlpage ${game.Y.id}, Connect Four + ${room} + ${id}, <center><h1>Game over!</h1>${game.boardHTML()}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.R.id}, Connect Four + ${room} + ${id}, <center><h1>Game over!</h1>${game.boardHTML()}</center>`);
			Bot.say(room, winner && winner !== 'none' ? `${game[winner].name} (${winner === 'Y' ? 'Yellow' : 'Red'}) won!` : 'The game ended as a draw!');
			delete Bot.rooms[room].connectfour[id];
			sendEmbed(room, winner, players, board, logs, rows);
			return;
			break;
		}
		case 'resign': {
			clearGameTimer(game);
			const loser = info, players = { Y: game.Y.name, R: game.R.name }, board = game.board, logs = game.moves.join(''), winner = loser === 'Y' ? 'R' : 'Y', rows = game.rows;
			fs.unlink(`./data/BACKUPS/connectfour-${room}-${id}.json`, e => {});
			Bot.say(room, `/adduhtml CONNECTFOUR-${Date.now()},<center>${game.boardHTML(false, true)}</center>`);
			game.spectators.forEach(spect => Bot.say(room, `/sendhtmlpage ${spect}, Connect Four + ${room} + ${id}, <center><h1>Resigned.</h1>${game.boardHTML(false)}</center>`));
			Bot.say(room, `/sendhtmlpage ${game.Y.id}, Connect Four + ${room} + ${id}, <center><h1>Resigned.</h1>${game.boardHTML()}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.R.id}, Connect Four + ${room} + ${id}, <center><h1>Resigned.</h1>${game.boardHTML()}</center>`);
			Bot.say(room, `${players[winner]} won by forfeit!`);
			delete Bot.rooms[room].connectfour[id];
			sendEmbed(room, winner, players, board, logs, rows);
			return;
			break;
		}
	}
	fs.writeFile(`./data/BACKUPS/connectfour-${room}-${id}.json`, JSON.stringify(game), e => {
		if (e) console.log(e);
	});
}

module.exports = {
	help: `Players take turns dropping a piece into one of the columns (Yellow goes first and red goes second). The first player to connect 4 pieces in a row horizontally, vertically, or diagonally is the winner.`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client, isPM) {
		if (!args[0]) args.push('help');
		switch (args[0].toLowerCase()) {
			case 'help': case 'h': {
				if (tools.hasPermission(by, 'gamma', room) && !isPM) return Bot.say(room, this.help);
				else Bot.roomReply(room, by, this.help);
				break;
			}
			case 'new': case 'n': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (isPM) return Bot.roomReply(room, by, `Thou art stinky, do this in a chatroom`);
				if (!tools.canHTML(room)) return Bot.say(room, 'I can\'t do that here. Ask an RO to promote me or something.');
				Bot.say(room, `/sendprivatehtmlbox ${by}, <h2>Psst; in the future use ]connectfour instead! This version is being phased out.</h2>`);
				if (!Bot.rooms[room].connectfour) Bot.rooms[room].connectfour = {};
				const id = Date.now();
				Bot.rooms[room].connectfour[id] = GAMES.create('connectfour', id, {}, room);
				Bot.say(room, `/adduhtml CONNECTFOUR-${id}, <hr/><h1>Connect Four Signups have begun!</h1><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}connectfour ${room}, join ${id} Yellow">Yellow</button><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}connectfour ${room}, join ${id} Red">Red</button><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}connectfour ${room}, join ${id} Any">Random</button><hr/>`);
				Bot.say(room, '/notifyrank all, Connect Four, A new game of Connect Four has been created!,connectfoursignup');
				return;
				break;
			}
			case 'join': case 'j': {
				if (!Bot.rooms[room].connectfour) return Bot.roomReply(room, by, 'There isn\'t an active Connect Four game in this room.');
				if (!args[1]) return Bot.roomReply(room, by, 'Please specify the ID / side.');
				let id, side, user = toID(by), rand = false;
				if (args[2] && parseInt(args[1])) {
					id = args[1];
					side = args[2][0].toUpperCase();
					if (side === 'A') {
						side = ['Y', 'R'].random();
						rand = true;
					}
					if (!["Y", "R"].includes(side)) return Bot.roomReply(room, by, "I only accept yellow and red. (insert snarky comment)");
				} else if (Object.keys(Bot.rooms[room].connectfour).length === 1) {
					id = Object.keys(Bot.rooms[room].connectfour)[0];
					side = args[1][0].toUpperCase();
					if (side === 'A') {
						side = ['Y', 'R'].random();
						rand = true;
					}
					if (!["Y", "R"].includes(side)) return Bot.roomReply(room, by, "I only accept yellow and red. (insert snarky comment)");
				} else {
					side = args[1][0].toUpperCase();
					if (side === 'A') {
						side = ['Y', 'R'].random();
						rand = true;
					}
					if (!["Y", "R"].includes(side)) return Bot.roomReply(room, by, "I only accept yellow and red. (insert snarky comment)");
					id = Object.keys(Bot.rooms[room].connectfour).find(k => {
						const game = Bot.rooms[room].connectfour[k];
						return game && !game.started && !game[side].id;
					});
					if (!id) return Bot.roomReply(room, by, "Sorry, unable to find any open games.");
				}
				const game = Bot.rooms[room].connectfour[id];
				if (!game) return Bot.roomReply(room, by, "Nope. BOOP");
				if (game.started) return Bot.roomReply(room, by, 'Too late!');
				if (game[side].id) return Bot.roomReply(room, by, "Sorry, already taken!");
				const other = side === 'Y' ? 'R' : 'Y';
				if (game[other].id === user) return Bot.roomReply(room, by, "~~You couldn't find anyone else to fight you? __Really__?~~");
				// UGOCODE
				/*
				if (UGOR(room)) {
					const userGames = Bot.UGO.object()[user];
					const played = Number(userGames?.[gameName]) || 0;
					if (played >= gameLimit) return Bot.roomReply(room, by, `You have already played ${played} games of ${gameTitle} today and reached the maximum! The count resets at midnight UTC every day.`)
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
				Bot.say(room, `${by.substr(1)} joined Connect Four (#${id}) as ${side === 'Y' ? 'Yellow' : 'Red'}!${rand ? ' (random)' : ''}`);
				runMoves('join', { user: by.substr(1), side: side }, game);
				break;
			}
			case 'play': case 'move': case 'click': {
				if (!Bot.rooms[room].connectfour) return Bot.roomReply(room, by, 'There isn\'t an active Connect Four game in this room.');
				if (!args[1]) return Bot.roomReply(room, by, unxa);
				args.shift();
				if (!Object.keys(Bot.rooms[room].connectfour).length) return Bot.roomReply(room, by, "No games are active.");
				let id, user = toID(by);
				if (args[0] && /^\d+$/.test(args[0].trim())) id = args.shift().trim();
				else id = Object.keys(Bot.rooms[room].connectfour).find(k => {
					const game = Bot.rooms[room].connectfour[k];
					return game && game.started && !game[game.turn].id === user;
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].connectfour[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (!game.started) return Bot.roomReply(room, by, 'OI, IT HASN\'T STARTED!');
				if (!(game[game.turn].id === toID(by))) return;
				let coords = args.join('').split(',');
				if (coords.length !== 1) return Bot.roomReply(room, by, "I need one coordinate to play - why not click on the board instead?");
				coords = coords.map(t => parseInt(toID(t)));
				if (isNaN(coords[0])) return Bot.roomReply(room, by, "Invalid coordinate. ;-;");
				game.drop(coords[0]).then(res => {
					delete game.Y.isResigning;
					delete game.R.isResigning;
					clearGameTimer(game);
					if (res) {
						// UGOCODE
						/*
						if (UGOR(room)) {
							const played = Number(Bot.UGO.get(user)?.[gameName]);
							if (played <= pointsLimit) awardUGOPoints(pointsWin, [toID(user)]);
							awardUGOPoints(pointsLose, [game.Y.id === user ? game.R.id : game.Y.id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
						}
						*/
						// ENDUGOCODE
						return runMoves('end', res, game);
					}
					if (game.board.find(col => col.length < game.rows)) {
						const turn = game[game.turn].name;
						gameTimer(game, turn);
						return runMoves('move', null, game);
					}
					// UGOCODE
					/*
					if (UGOR(room)) {
						awardUGOPoints(pointsDraw, [game.Y.id, game.R.id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
					}
					*/
					// ENDUGOCODE
					return runMoves('end', false, game);
				}).catch(why => Bot.roomReply(room, by, why));
				break;
			}
			case 'substitute': case 'sub': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].connectfour) return Bot.roomReply(room, by, 'This room does not have any Connect Four games.');
				args.shift();
				let id, cargs;
				if (!Object.keys(Bot.rooms[room].connectfour).length) return Bot.roomReply(room, by, "No games are active.");
				if (/^[^a-zA-Z]+$/.test(args[0])) id = toID(args.shift());
				else if (Object.keys(Bot.rooms[room].connectfour).length === 1) id = Object.keys(Bot.rooms[room].connectfour)[0];
				else {
					cargs = args.join(' ').split(/\s*,\s*/);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "I NEED TWO NAMES GIVE ME TWO NAMES");
					const id1 = toID(cargs[0]), id2 = toID(cargs[1]);
					id = Object.keys(Bot.rooms[room].connectfour).find(k => {
						const game = Bot.rooms[room].connectfour[k], ps = [game.Y.id, game.R.id];
						return game && game.started && (ps.includes(id1) && !ps.includes(id2) || !ps.includes(id1) && ps.includes(id2));
					});
				}
				cargs = args.join(' ').replace(/[<>]/g, '').split(/\s*,\s*/);
				if (cargs.length !== 2) return Bot.roomReply(room, by, "I NEED TWO NAMES GIVE ME TWO NAMES");
				if (!id) return Bot.roomReply(room, by, "Sorry, I couldn't find a valid game to sub.");
				const game = Bot.rooms[room].connectfour[id];
				if (!game.started) return Bot.roomReply(room, by, 'Excuse me?');
				cargs = cargs.map(carg => carg.trim());
				const users = cargs.map(carg => toID(carg));
				if (users.includes(game.Y.id) && users.includes(game.R.id) || !users.includes(game.Y.id) && !users.includes(game.R.id)) return Bot.say(room, 'Those users? Something\'s wrong with those...');
				if ([game.Y.id, game.R.id].includes(toID(by)) && !tools.hasPermission(by, 'coder')) return Bot.say(room, "Hah! Can't sub yourself out."); // UGOCODE beta -> coder
				// UGOCODE
				/*
				if (UGOR(room)) {
					const coming = users.find(u => ![game.Y.id, game.R.id].includes(u)), going = users.find(u => [game.Y.id, game.R.id].includes(u));
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
				if (users.includes(game.Y.id)) {
					if (users[0] == game.Y.id) {
						Bot.say(room, `${game.Y.name} was subbed with ${cargs[1]}!`);
						game.Y.id = users[1];
						game.Y.name = cargs[1];
						ex = users[0];
						add = users[1];
					} else {
						Bot.say(room, `${game.Y.name} was subbed with ${cargs[0]}!`);
						game.Y.id = users[0];
						game.Y.name = cargs[0];
						ex = users[1];
						add = users[0];
					}
				} else {
					if (users[0] == game.R.id) {
						Bot.say(room, `${game.R.name} was subbed with ${cargs[1]}!`);
						game.R.id = users[1];
						game.R.name = cargs[1];
						ex = users[0];
						add = users[1];
					} else {
						Bot.say(room, `${game.R.name} was subbed with ${cargs[0]}!`);
						game.R.id = users[0];
						game.R.name = cargs[0];
						ex = users[1];
						add = users[0];
					}
				}
				game.spectators.remove(add);
				game.spectators.push(ex);
				runMoves('move', null, game);
				break;
			}
			case 'end': case 'e': {
				if (!Bot.rooms[room].connectfour) return Bot.roomReply(room, by, 'This room does not have any Connect Four games.');
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				args.shift();
				let id;
				if (!Object.keys(Bot.rooms[room].connectfour).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].connectfour).length === 1) id = Object.keys(Bot.rooms[room].connectfour)[0];
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, unxa);
					id = Object.keys(Bot.rooms[room].connectfour).find(k => {
						const game = Bot.rooms[room].connectfour[k];
						if (cargs.includes(game.Y.id) && cargs.includes(game.R.id)) return true;
					});
				}
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].connectfour[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				if (!game.started) Bot.say(room, `/changeuhtml CONNECTFOUR-${id}, <hr/>Ended. :(<hr/>`);
				// UGOCODE
				/*
				if (UGOR(room)) {
					const users = [game.Y.id, game.R.id].filter(t => t);
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
				clearGameTimer(game);
				delete Bot.rooms[room].connectfour[id];
				fs.unlink(`./data/BACKUPS/connectfour-${room}-${id}.json`, () => {});
				return Bot.say(room, `Welp, ended Connect Four#${id}.`);
				break;
			}
			case 'endf': case 'ef': {
				if (!Bot.rooms[room].connectfour) return Bot.roomReply(room, by, 'This room does not have any Connect Four games.');
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				args.shift();
				const [id, winner] = args.join('').split(',').map(toID);
				if (!Object.keys(Bot.rooms[room].connectfour).length) return Bot.roomReply(room, by, "No games are active.");
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].connectfour[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				if (!game.started) {
					// UGOCODE
					/*
					if (UGOR(room)) {
						const users = [game.Y.id, game.R.id].filter(t => t);
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
					clearGameTimer(game);
					delete Bot.rooms[room][gameName][game.id];
					fs.unlink(`./data/BACKUPS/connectfour-${room}-${id}.json`, () => {});
					return Bot.say(room, `/changeuhtml CONNECTFOUR-${id}, <hr/>Ended. :(<hr/>`);
				} else if (!winner || ![game.Y.id, game.R.id, 'none'].includes(winner)) return Bot.roomReply(room, by, `W-who won, again?`);
				if (toID(by) === winner) return Bot.roomReply(room, by, 'Only I may be corrupt');
				if (game.started) {
					// UGOCODE
					/*
					if (UGOR(room)) {
						if (winner !== 'none') {
							const played = Number(Bot.UGO.get(winner)?.[gameName]);
							if (played <= pointsLimit) awardUGOPoints(pointsWin, [toID(winner)]);
							awardUGOPoints(pointsLose, [game.Y.id === winner ? game.R.id : game.Y.id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
						} else {
							awardUGOPoints(pointsDraw, [game.Y.id, game.R.id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
						}
					}
					*/
					// ENDUGOCODE
				}
				clearGameTimer(game);
				runMoves('end', winner === game.Y.id ? 'Y' : 'R', game);
				break;
			}
			case 'backups': case 'bu': case 'stashed': case 'b': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, "Access denied.");
				if (isPM) return Bot.roomReply(room, by, `Please use this in the room. Please. PLEASE`);
				fs.readdir('./data/BACKUPS', (err, files) => {
					if (err) {
						Bot.say(room, err);
						return Bot.log(err);
					}
					const games = files.filter(file => file.startsWith(`connectfour-${room}-`)).map(file => file.slice(0, -4)).map(file => file.replace(/[^0-9]/g, ''));
					if (games.length) {
						Bot.say(room, `/adduhtml CONNECTFOURBACKUPS, <details><summary>Game Backups</summary><hr />${games.map(game => {
							try {
								const info = require(`../../data/BACKUPS/connectfour-${room}-${game}.json`);
								return `<button name="send" value="/botmsg ${Bot.status.nickName},${prefix}connectfour ${room} restore ${game}">${info.Y.name} vs ${info.R.name}</button>`;
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
				if (!id) return Bot.say(room, "Invalid ID.");
				if (Bot.rooms[room].connectfour?.[id]) return Bot.roomReply(room, by, "Sorry, that game is already in progress!");
				fs.readFile(`./data/BACKUPS/connectfour-${room}-${id}.json`, 'utf8', (err, file) => {
					if (err) return Bot.say(room, "Sorry, couldn't find that game!");
					if (!Bot.rooms[room].connectfour) Bot.rooms[room].connectfour = {};
					Bot.rooms[room].connectfour[id] = GAMES.create('connectfour', id, {}, room, JSON.parse(file));
					Bot.say(room, "Game has been restored!");
					const game = Bot.rooms[room].connectfour[id];
					game.spectators.forEach(spect => Bot.say(room, `/sendhtmlpage ${spect}, Connect Four + ${room} + ${id}, <center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`));
					Bot.say(room, `/sendhtmlpage ${game.Y.id}, Connect Four + ${room} + ${id}, ${game.turn === "Y" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
					Bot.say(room, `/sendhtmlpage ${game.R.id}, Connect Four + ${room} + ${id}, ${game.turn === "R" ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
				});
				return;
				break;
			}
			case 'menu': case 'm': case 'list': case 'l': case 'players': {
				const connectfour = Bot.rooms[room].connectfour;
				if (!connectfour || !Object.keys(connectfour).length) {
					if (tools.hasPermission(by, 'gamma', room) && !isPM) return Bot.say(room, "Sorry, no games found.");
					return Bot.roomReply(room, by, "Sorry, no games found.");
				}
				const html = `<hr />${Object.keys(connectfour).map(id => {
					const game = connectfour[id];
					return `${game.Y.name ? tools.colourize(game.Y.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}connectfour ${room} join ${id} Yellow">Yellow</button>`} vs ${game.R.name ? tools.colourize(game.R.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}connectfour ${room} join ${id} Red">Red</button>`} ${game.started ? `<button name="send" value ="/msg ${Bot.status.nickName}, ${prefix}connectfour ${room} spectate ${id}">Watch</button> ` : ''}(#${id})`;
				}).join('<br/>')}<hr />`;
				const staffHTML = `<hr />${Object.keys(connectfour).map(id => {
					const game = connectfour[id];
					return `${game.Y.name ? tools.colourize(game.Y.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}connectfour ${room} join ${id} Yellow">Yellow</button>`} vs ${game.R.name ? tools.colourize(game.R.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}connectfour ${room} join ${id} Red">Red</button>`} ${game.started ? `<button name="send" value ="/msg ${Bot.status.nickName}, ${prefix}connectfour ${room} spectate ${id}">Watch</button> ` : ''}<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}connectfour ${room} end ${id}">End</button> <button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}connectfour ${room} stash ${id}">Stash</button>(#${id})`;
				}).join('<br/>')}<hr />`;
				if (isPM === 'export') return [html, staffHTML];
				if (tools.hasPermission(by, 'gamma', room) && !isPM) {
					Bot.say(room, `/adduhtml CONNECTFOURMENU,${html}`);
					Bot.say(room, `/changerankuhtml +, CONNECTFOURMENU, ${staffHTML}`);
				} else Bot.say(room, `/sendprivatehtmlbox ${by}, ${html}`);
				break;
			}
			case 'resign': case 'forfeit': case 'f': case 'ff': case 'ihavebeenpwned': case 'bully': {
				if (!Bot.rooms[room].connectfour) return Bot.roomReply(room, by, 'There isn\'t an active Connect Four game in this room.');
				args.shift();
				let id, user = toID(by);
				if (args.length) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].connectfour).length === 1) id = Object.keys(Bot.rooms[room].connectfour)[0];
				else id = Object.keys(Bot.rooms[room].connectfour).find(k => {
					const game = Bot.rooms[room].connectfour[k];
					return game && game.started && [game.Y.id, game.R.id].includes(user);
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].connectfour[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (!game.started) return Bot.roomReply(room, by, '>resigning before it starts');
				if (![game.Y.id, game.R.id].includes(user)) return Bot.roomReply(room, by, "Only a player can resign.");
				const side = game.Y.id === user ? "Y" : "R";
				if (!game[side].isResigning) {
					Bot.roomReply(room, by, 'Are you sure you want to resign? If you are, use this command again.');
					return game[side].isResigning = true;
				}
				// UGOCODE
				/*
				if (UGOR(room)) {
					const played = Number(Bot.UGO.get(game[side === 'Y' ? 'R' : 'Y'].id)?.[gameName]);
					if (played <= pointsLimit) awardUGOPoints(pointsWin, [toID(game[side === 'Y' ? 'R' : 'Y'].name)]);
					awardUGOPoints(pointsLose, [game[side].name].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
				}
				*/
				// ENDUGOCODE
				clearGameTimer(game);
				runMoves('resign', side, game);
				break;
			}
			case 'spectate': case 's': case 'watch': case 'w': {
				if (!Bot.rooms[room].connectfour) return Bot.roomReply(room, by, 'This room does not have any Connect Four games.');
				args.shift();
				let id;
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].connectfour).length === 1) id = Object.keys(Bot.rooms[room].connectfour)[0];
				else if (Object.values(Bot.rooms[room].connectfour).filter(game => game.started).length === 1) id = Object.values(Bot.rooms[room].connectfour).filter(game => game.started)[0].id;
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "Sorry, specify the players again?");
					id = Object.keys(Bot.rooms[room].connectfour).find(k => {
						const game = Bot.rooms[room].connectfour[k];
						if (cargs.includes(game.Y.id) && cargs.includes(game.R.id) && !game.spectators.includes(toID(by))) return true;
					});
				}
				const game = Bot.rooms[room].connectfour[id];
				if (!game) return Bot.roomReply(room, by, "Sorry, no Connect Four game here to spectate.");
				if (!game.started) Bot.roomReply(room, by, "Oki, I'll send you the board when it starts.");
				const user = toID(by);
				if ([game.Y.id, game.R.id].includes(user)) return Bot.roomReply(room, by, "Imagine spectating your own game.");
				if (!game.spectators.includes(user)) game.spectators.push(user);
				Bot.say(room, `/sendhtmlpage ${by}, Connect Four + ${room} + ${id}, <center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`);
				return Bot.roomReply(room, by, `You are now spectating the Connect Four match between ${game.Y.name} and ${game.R.name}!`);
				break;
			}
			case 'unspectate': case 'us': case 'unwatch': case 'uw': case 'zestoflifeisstinky': {
				if (!Bot.rooms[room].connectfour) return Bot.roomReply(room, by, 'This room does not have any Connect Four games.');
				args.shift();
				let id;
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.values(Bot.rooms[room].connectfour).filter(game => game.spectators.includes(toID(by))).length === 1) id = Object.values(Bot.rooms[room].connectfour).filter(game => game.spectators.includes(toID(by)))[0].id;
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "Sorry, didn't get the game you meant.");
					id = Object.keys(Bot.rooms[room].connectfour).find(k => {
						const game = Bot.rooms[room].connectfour[k];
						if (cargs.includes(game.Y.id) && cargs.includes(game.R.id) && game.spectators.includes(toID(by))) return true;
					});
				}
				const game = Bot.rooms[room].connectfour[id];
				if (!game) return Bot.roomReply(room, by, "Sorry, no Connect Four game here to unspectate.");
				if (!game.started) return Bot.roomReply(room, by, "AYAYAYA - no.");
				const user = toID(by);
				if ([game.Y.id, game.R.id].includes(user)) return Bot.roomReply(room, by, "Imagine unspectating your own game.");
				if (!game.spectators.includes(user)) return Bot.roomReply(room, by, `You aren't spectating! If you want to, use \`\`${prefix}connectfour spectate\`\` instead!`);
				game.spectators.remove(user);
				return Bot.roomReply(room, by, `You are no longer spectating the Connect Four match between ${game.Y.name} and ${game.R.name}.`);
				break;
			}
			case 'rejoin': case 'rj': {
				const games = Bot.rooms[room].connectfour;
				if (!games) return Bot.roomReply(room, by, "Sorry, no Connect Four game here to spectate.");
				const user = toID(by);
				const ids = Object.keys(games).filter(key => [games[key].Y.id, games[key].R.id, ...games[key].spectators].includes(user));
				if (!ids.length) return Bot.roomReply(room, by, "Couldn't find any games for you to rejoin.");
				ids.forEach(id => {
					let game = games[id], side;
					if (game.Y.id === user) side = "Y";
					if (game.R.id === user) side = "R";
					if (!side && !game.spectators.includes(toID(by))) return Bot.roomReply(room, by, `You don't look like a player / spectator - try ${prefix}connectfour spectate ${id}... ;-;`);
					if (game.spectators.includes(user)) Bot.say(room, `/sendhtmlpage ${by}, Connect Four + ${room} + ${id}, <center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`);
					else Bot.say(room, `/sendhtmlpage ${user}, Connect Four + ${room} + ${id}, ${game.turn === side ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
				});
				break;
			}
			case 'stash': case 'store': case 'freeze': case 'hold': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].connectfour) return Bot.roomReply(room, by, 'This room does not have any Connect Four games.');
				args.shift();
				let id;
				if (!Object.keys(Bot.rooms[room].connectfour).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].connectfour).length === 1) id = Object.keys(Bot.rooms[room].connectfour)[0];
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, unxa);
					id = Object.keys(Bot.rooms[room].connectfour).find(k => {
						const game = Bot.rooms[room].connectfour[k];
						if (cargs.includes(game.Y.id) && cargs.includes(game.R.id)) return true;
					});
				}
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].connectfour[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				Bot.say(room, `The Connect Four match between ${game.Y.name || '(no one)'} and ${game.R.name || '(no one)'} has been put on hold!`);
				delete Bot.rooms[room].connectfour[id];
				break;
			}
			default: {
				Bot.roomReply(room, by, `That, uhh, doesn't seem to be something I recognize?`);
				break;
			}
		}
	}
};
