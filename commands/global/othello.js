// UGOCODE
/*
const gameLimit = 1000;
const pointsLimit = 20;
const gameName = 'othello';
const gameTitle = 'Othello';
const pointsWin = 15;
const pointsDraw = 12;
const pointsLose = 10;
*/

function gameTimer (game, turn) {
	const time = 60;
	if (!Bot.rooms[game.room]) return;
	if (!Bot.rooms[game.room].gameTimers) Bot.rooms[game.room].gameTimers = {};
	const gameTimers = Bot.rooms[game.room].gameTimers;
	clearTimeout(gameTimers[game.id]);
	gameTimers[game.id] = setTimeout(() => Bot.say(game.room, `${turn} hasn't played for the past ${time} seconds...`), time * 1000);
}

function clearGameTimer (game) {
	clearTimeout(Bot.rooms[game.room]?.gameTimers?.[game.id]);
}

function sendEmbed (room, winner, players, board, logs, scores) {
	Bot.say(room, `${websiteLink}/othello/${logs}`);
	if (!['boardgames'].includes(room)) return;
	const Embed = require('discord.js').MessageEmbed, embed = new Embed();
	embed
		.setColor('#008000')
		.setAuthor('Othello - Room Match')
		.setTitle((winner === 'W' ? `**${players.W}**` : players.W) + ' vs ' + (winner === 'B' ? `**${players.B}**` : players.B))
		.setURL(`${websiteLink}/othello/${logs}`)
		.addField(scores ? scores.join(' - ') : '\u200b', Object.values(board).map(row => row.map(cell => {
			switch (cell) {
				case 'B': return ':black_circle:';
				case 'W': return ':white_circle:';
				default: return ':green_circle:';
			}
		}).join('')).join('\n'));
	client.channels.cache.get('576488243126599700').send(embed).catch(e => {
		Bot.say(room, 'Unable to send the game to the Discord because ' + e.message);
		Bot.log(e);
	});
}

function runMoves (run, info, game) {
	const room = game.room, id = game.id;
	switch (run) {
		case 'start': {
			game.start();
			Bot.say(room, `Othello: ${game.W.name} vs ${game.B.name} GOGO`);
			// eslint-disable-next-line max-len
			return game.spectatorSend(`<center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`).then(() => {
				// eslint-disable-next-line max-len
				Bot.say(room, `/sendhtmlpage ${game.W.id}, Othello + ${room} + ${id}, ${game.turn === 'W' ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
				// eslint-disable-next-line max-len
				Bot.say(room, `/sendhtmlpage ${game.B.id}, Othello + ${room} + ${id}, ${game.turn === 'B' ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
				setTimeout(() => {
					Bot.say(room, `/highlighthtmlpage ${game.W.id}, Othello + ${room} + ${id}, Your turn!`);
				}, 1000);
				// eslint-disable-next-line max-len
				Bot.say(room, `/adduhtml OTHELLO-${id},<hr />${tools.colourize(game.W.name)} vs ${tools.colourize(game.B.name)}! <div style="text-align: right; display: inline-block; font-size: 0.9em; float: right;"><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room} spectate ${id}">Watch!</button></div><hr />`);
			});
		}
		case 'join': {
			const { user, side } = info;
			game[side].id = toID(user);
			game[side].name = user.replace(/[<>]/g, '');
			if (game.W.id && game.B.id) return runMoves('start', null, game);
			// eslint-disable-next-line max-len
			const html = `<hr /><h1>Othello Signups are active!</h1>${['W', 'B'].filter(side => !game[side].id).map(side => `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room}, join ${id} ${side === 'W' ? 'White' : 'Black'}">${side === 'W' ? 'White' : 'Black'}</button>`).join('&nbsp;')}<hr />`;
			return Bot.say(room, `/adduhtml OTHELLO-${id}, ${html}`);
		}
		case 'W': case 'B': {
			game.spectatorSend(`<center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`);
			// eslint-disable-next-line max-len
			Bot.say(room, `/sendhtmlpage ${game.W.id}, Othello + ${room} + ${id}, ${game.turn === 'W' ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
			// eslint-disable-next-line max-len
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Othello + ${room} + ${id}, ${game.turn === 'B' ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
			setTimeout(() => {
				Bot.say(room, `/highlighthtmlpage ${game[game.turn].id}, Othello + ${room} + ${id}, Your turn!`);
			}, 1000);
			break;
		}
		case 'resign': {
			clearGameTimer(game);
			const loser = info, players = { W: game.W.name, B: game.B.name }, board = game.board,  winner = loser === 'W' ? 'B' : 'W';
			let logs = game.moves;
			fs.unlink(`./data/BACKUPS/othello-${room}-${id}.json`, e => {});
			Bot.say(room, `/adduhtml OTHELLO-${Date.now()},<center>${game.boardHTML()}</center>`);
			game.spectatorSend(`<center><h1>Resigned.</h1>${game.boardHTML()}</center>`);
			// eslint-disable-next-line max-len
			Bot.say(room, `/sendhtmlpage ${game.W.id}, Othello + ${room} + ${id}, <center><h1>Resigned.</h1>${game.boardHTML(true)}</center>`);
			// eslint-disable-next-line max-len
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Othello + ${room} + ${id}, <center><h1>Resigned.</h1>${game.boardHTML(true)}</center>`);
			Bot.say(room, `${players[loser]} resigned.`);
			logs += winner === 'W' ? 'Y' : 'Z';
			// UGOCODE
			/*
			if (UGOR(room)) {
				const played = Number(Bot.UGO.get(game[winner].id)?.[gameName]);
				if (played <= pointsLimit) awardUGOPoints(pointsWin, [toID(game[winner].id)]);
				awardUGOPoints(pointsLose, [game[loser].id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
			}
			*/
			// ENDUGOCODE
			delete Bot.rooms[room].othello[id];
			return sendEmbed(room, winner, players, board, logs);
		}
		case 'forcedraw': {
			clearGameTimer(game);
			const players = { W: game.W.name, B: game.B.name }, board = game.board;
			let logs = game.moves;
			fs.unlink(`./data/BACKUPS/othello-${room}-${id}.json`, e => {});
			Bot.say(room, `/adduhtml OTHELLO-${Date.now()},<center>${game.boardHTML()}</center>`);
			game.spectatorSend(`<center><h1>Force-drawed</h1>${game.boardHTML()}</center>`);
			// eslint-disable-next-line max-len
			Bot.say(room, `/sendhtmlpage ${game.W.id}, Othello + ${room} + ${id}, <center><h1>Force-drawed</h1>${game.boardHTML(true)}</center>`);
			// eslint-disable-next-line max-len
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Othello + ${room} + ${id}, <center><h1>Force-drawed</h1>${game.boardHTML(true)}</center>`);
			Bot.say(room, `The game was forcefully drawn.`);
			logs += '_';
			// UGOCODE
			/*
			if (UGOR(room)) {
				awardUGOPoints(pointsDraw, [game.W.id, game.B.id].filter(p => Number(Bot.UGO.get(p)?.[gameName]) <= pointsLimit));
			}
			*/
			// ENDUGOCODE
			delete Bot.rooms[room].othello[id];
			return sendEmbed(room, 'O', players, board, logs);
		}
		default: {
			clearGameTimer(game);
			const info = JSON.parse(run);
			const winner = info.winner, players = { W: game.W.name, B: game.B.name }, board = game.board, logs = game.moves;
			fs.unlink(`./data/BACKUPS/othello-${room}-${id}.json`, e => {});
			Bot.say(room, `/adduhtml OTHELLO-${Date.now()},<center>${game.boardHTML(false, true)}</center>`);
			game.spectatorSend(`<center><h1>Game Ended.</h1>${game.boardHTML()}</center>`);
			// eslint-disable-next-line max-len
			Bot.say(room, `/sendhtmlpage ${game.W.id}, Othello + ${room} + ${id}, <center><h1>Game Ended.</h1>${game.boardHTML('W', true)}</center>`);
			// eslint-disable-next-line max-len
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Othello + ${room} + ${id}, <center><h1>Game Ended.</h1>${game.boardHTML('B', true)}</center>`);
			let wScore, bScore;
			// eslint-disable-next-line max-len
			Bot.say(room, `Game ended! ${game[winner] ? `${game[winner].name} won!` : 'It was a draw!'} ${wScore = board.reduce((accu, row) => accu + row.reduce((acc, cur) => cur === 'W' ? acc + 1 : acc, 0), 0)}W/${bScore = board.reduce((accu, row) => accu + row.reduce((acc, cur) => cur === 'B' ? acc + 1 : acc, 0), 0)}B`);
			// UGOCODE
			/*
			if (UGOR(room)) {
				if (game[winner]) {
					const played = Number(Bot.UGO.get(game[winner].id)?.[gameName] || 0);
					if (played <= pointsLimit) awardUGOPoints(pointsWin, [game[winner].id]);
					awardUGOPoints(pointsLose, [game[winner === 'W' ? 'B' : 'W'].id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName] || 0) <= pointsLimit));
				} else {
					awardUGOPoints(pointsDraw, [game.W.id, game.B.id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName] || 0) <= pointsLimit));
				}
			}
			*/
			// ENDUGOCODE
			delete Bot.rooms[room].othello[id];
			return sendEmbed(room, winner, players, board, logs, [wScore, bScore]);
		}
	}
	fs.writeFile(`./data/BACKUPS/othello-${room}-${id}.json`, JSON.stringify(game), e => {
		if (e) console.log(e);
	});
}

module.exports = {
	// eslint-disable-next-line max-len
	help: `The Othello module. Use \`\`${prefix}othello new\`\` to make a game, and \`\`${prefix}othello spectate\`\` to watch. To resign, use \`\`${prefix}othello resign\`\`. Rules: https://www.worldothello.org/about/about-othello/othello-rules/official-rules/english`,
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
				Bot.say(room, `/sendprivatehtmlbox ${by}, <h2>Psst; in the future use ]othello instead! This version is being phased out.</h2>`);
				if (!Bot.rooms[room].othello) Bot.rooms[room].othello = {};
				const id = Date.now();
				Bot.rooms[room].othello[id] = GAMES.create('othello', id, room);
				// eslint-disable-next-line max-len
				Bot.say(room, `/adduhtml OTHELLO-${id}, <hr/><h1>Othello Signups have begun!</h1><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room}, join ${id} White">White</button><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room}, join ${id} Black">Black</button><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room}, join ${id} Random">Random</button><hr/>`);
				Bot.say(room, '/notifyrank all, Othello, A new game of Othello has been created!,othellosignup');
				break;
			}
			case 'join': case 'j': {
				if (!Bot.rooms[room].othello) return Bot.roomReply(room, by, 'There isn\'t an active Othello game in this room.');
				if (!args[1]) return Bot.roomReply(room, by, 'Please specify the ID / side.');
				const user = toID(by);
				let id, side, rand = false;
				if (args[2] && parseInt(args[1])) {
					id = args[1];
					side = args[2][0].toUpperCase();
					if (side === 'R') {
						side = ['W', 'B'].random();
						rand = true;
					}
					if (!['W', 'B'].includes(side)) {
						return Bot.roomReply(room, by, "I only accept white and black. (insert snarky comment)");
					}
				} else if (Object.keys(Bot.rooms[room].othello).length === 1) {
					id = Object.keys(Bot.rooms[room].othello)[0];
					side = args[1][0].toUpperCase();
					if (side === 'R') {
						side = ['W', 'B'].random();
						rand = true;
					}
					if (!['W', 'B'].includes(side)) {
						return Bot.roomReply(room, by, "I only accept white and black. (insert snarky comment)");
					}
				} else {
					side = args[1][0].toUpperCase();
					if (side === 'R') {
						side = ['W', 'B'].random();
						rand = true;
					}
					if (!['W', 'B'].includes(side)) {
						return Bot.roomReply(room, by, "I only accept white and black. (insert snarky comment)");
					}
					id = Object.keys(Bot.rooms[room].othello).find(k => {
						const game = Bot.rooms[room].othello[k];
						return game && !game.started && !game[side].id;
					});
					if (!id) return Bot.roomReply(room, by, "Sorry, unable to find any open games.");
				}
				const game = Bot.rooms[room].othello[id];
				if (!game) return Bot.roomReply(room, by, "Nope. BOOP");
				if (game.started) return Bot.roomReply(room, by, 'Too late!');
				if (game[side].id) return Bot.roomReply(room, by, "Sorry, already taken!");
				const other = side === 'W' ? 'B' : 'W';
				if (game[other].id === user) {
					return Bot.roomReply(room, by, "~~You couldn't find anyone else to fight you? __Really__?~~");
				}
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
				// eslint-disable-next-line max-len
				Bot.say(room, `${by.substr(1)} joined Othello (#${id}) as ${side === 'W' ? 'White' : 'Black'}!${rand ? ' (random)' : ''}`);
				runMoves('join', { user: by.substr(1), side: side }, game);
				break;
			}
			case 'play': case 'move': case 'click': {
				if (!Bot.rooms[room].othello) return Bot.roomReply(room, by, 'There isn\'t an active Othello game in this room.');
				if (!args[1]) return Bot.roomReply(room, by, unxa);
				args.shift();
				if (!Object.keys(Bot.rooms[room].othello).length) return Bot.roomReply(room, by, "No games are active.");
				let id;
				const user = toID(by);
				if (args[0] && /^\d+$/.test(args[0].trim())) id = args.shift().trim();
				else id = Object.keys(Bot.rooms[room].othello).find(k => {
					const game = Bot.rooms[room].othello[k];
					return game && game.started && !game[game.turn].id === user;
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].othello[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (!game.started) return Bot.roomReply(room, by, 'OI, IT HASN\'T STARTED!');
				if (!(game[game.turn].id === toID(by))) return;
				let coords = args.join('').split(',');
				if (coords.length !== 2) {
					return Bot.roomReply(room, by, "I need two coordinates to play - why not click on the board instead?");
				}
				coords = coords.map(t => parseInt(toID(t)));
				if (isNaN(coords[0]) || isNaN(coords[1])) return Bot.roomReply(room, by, "Invalid coordinates. ;-;");
				const canPlay = game.canPlay(...coords);
				if (!canPlay) return Bot.roomReply(room, by, "Sorry, you can't play there!");
				delete game.W.isResigning;
				delete game.B.isResigning;
				clearGameTimer(game);
				gameTimer(game, game[game.turn === 'W' ? 'B' : 'W'].name);
				game.play(coords[0], coords[1]);
				runMoves(game.nextTurn(), null, game);
				break;
			}
			case 'substitute': case 'sub': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].othello) return Bot.roomReply(room, by, 'This room does not have any Othello games.');
				args.shift();
				let id, cargs;
				if (!Object.keys(Bot.rooms[room].othello).length) return Bot.roomReply(room, by, "No games are active.");
				if (/^[^a-zA-Z]+$/.test(args[0])) id = toID(args.shift());
				else if (Object.keys(Bot.rooms[room].othello).length === 1) id = Object.keys(Bot.rooms[room].othello)[0];
				else {
					cargs = args.join(' ').split(/\s*,\s*/);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "I NEED TWO NAMES GIVE ME TWO NAMES");
					const id1 = toID(cargs[0]), id2 = toID(cargs[1]);
					id = Object.keys(Bot.rooms[room].othello).find(k => {
						const game = Bot.rooms[room].othello[k], ps = [game.W.id, game.B.id];
						return game?.started && (ps.includes(id1) && !ps.includes(id2) || !ps.includes(id1) && ps.includes(id2));
					});
				}
				cargs = args.join(' ').replace(/[<>]/g, '').split(/\s*,\s*/);
				if (cargs.length !== 2) return Bot.roomReply(room, by, "I NEED TWO NAMES GIVE ME TWO NAMES");
				if (!id) return Bot.roomReply(room, by, "Sorry, I couldn't find a valid game to sub.");
				const game = Bot.rooms[room].othello[id];
				if (!game.started) return Bot.roomReply(room, by, 'Excuse me?');
				cargs = cargs.map(carg => carg.trim());
				const users = cargs.map(carg => toID(carg));
				if (
					users.includes(game.W.id) && users.includes(game.B.id) ||
					!users.includes(game.W.id) && !users.includes(game.B.id)
				) return Bot.say(room, 'Those users? Something\'s wrong with those...');
				if ([game.W.id, game.B.id].includes(toID(by)) && !tools.hasPermission(by, 'coder')) {
					return Bot.say(room, "Hah! Can't sub yourself out.");
				}
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
					if (users[0] === game.W.id) {
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
					if (users[0] === game.B.id) {
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
				game.spectators.remove(add);
				game.spectators.push(ex);
				runMoves(game.turn, null, game);
				break;
			}
			case 'end': case 'e': {
				if (!Bot.rooms[room].othello) return Bot.roomReply(room, by, 'This room does not have any Othello games.');
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				args.shift();
				let id;
				if (!Object.keys(Bot.rooms[room].othello).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].othello).length === 1) id = Object.keys(Bot.rooms[room].othello)[0];
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, unxa);
					id = Object.keys(Bot.rooms[room].othello).find(k => {
						const game = Bot.rooms[room].othello[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id)) return true;
					});
				}
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].othello[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				if (!game.started) Bot.say(room, `/changeuhtml OTHELLO-${id}, <hr/>Ended. :(<hr/>`);
				clearGameTimer(game);
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
				delete Bot.rooms[room].othello[id];
				fs.unlink(`./data/BACKUPS/othello-${room}-${id}.json`, () => {});
				return Bot.say(room, `Welp, ended Othello#${id}.`);
			}
			case 'endf': case 'ef': {
				if (!Bot.rooms[room].othello) return Bot.roomReply(room, by, 'This room does not have any Othello games.');
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				args.shift();
				const [id, winner] = args.join('').split(',').map(toID);
				if (!Object.keys(Bot.rooms[room].othello).length) return Bot.roomReply(room, by, "No games are active.");
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].othello[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				clearGameTimer(game);
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
					delete Bot.rooms[room][gameName][game.id];
					fs.unlink(`./data/BACKUPS/othello-${room}-${id}.json`, () => {});
					return Bot.say(room, `/changeuhtml OTHELLO-${id}, <hr/>Ended. :(<hr/>`);
				} else if (!winner || ![game.W.id, game.B.id, 'none'].includes(winner)) {
					return Bot.roomReply(room, by, `W-who won, again?`);
				}
				if (toID(by) === winner) return Bot.roomReply(room, by, 'Only I may be corrupt');
				runMoves(winner === 'none' ? 'forcedraw' : 'resign', game.W.id === winner ? 'B' : 'W', game);
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
					const games = files
						.filter(file => file.startsWith(`othello-${room}-`))
						.map(file => file.slice(0, -4))
						.map(file => file.replace(/[^0-9]/g, ''));
					if (games.length) {
						Bot.say(room, `/adduhtml OTHELLOBACKUPS, <details><summary>Game Backups</summary><hr />${games.map(game => {
							try {
								const info = require(`../../data/BACKUPS/othello-${room}-${game}.json`);
								// eslint-disable-next-line max-len
								return `<button name="send" value="/botmsg ${Bot.status.nickName},${prefix}othello ${room} restore ${game}">${info.W.name} vs ${info.B.name}</button>`;
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
				if (Bot.rooms[room].othello?.[id]) return Bot.roomReply(room, by, "Sorry, that game is already in progress!");
				fs.readFile(`./data/BACKUPS/othello-${room}-${id}.json`, 'utf8', (err, file) => {
					if (err) return Bot.say(room, "Sorry, couldn't find that game!");
					if (!Bot.rooms[room].othello) Bot.rooms[room].othello = {};
					Bot.rooms[room].othello[id] = GAMES.create('othello', id, room, JSON.parse(file));
					Bot.say(room, "Game has been restored!");
					const game = Bot.rooms[room].othello[id];
					game.spectatorSend(`<center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`);
					// eslint-disable-next-line max-len
					Bot.say(room, `/sendhtmlpage ${game.W.id}, Othello + ${room} + ${id}, ${game.turn === 'W' ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
					// eslint-disable-next-line max-len
					Bot.say(room, `/sendhtmlpage ${game.B.id}, Othello + ${room} + ${id}, ${game.turn === 'B' ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
				});
				break;
			}
			case 'menu': case 'm': case 'list': case 'l': case 'players': {
				const othello = Bot.rooms[room].othello;
				if (!othello || !Object.keys(othello).length) {
					if (tools.hasPermission(by, 'gamma', room) && !isPM) return Bot.say(room, "Sorry, no games found.");
					return Bot.roomReply(room, by, "Sorry, no games found.");
				}
				const html = `<hr />${Object.keys(othello).map(id => {
					const game = othello[id];
					// eslint-disable-next-line max-len
					return `${game.W.name ? tools.colourize(game.W.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room} join ${id} White">White</button>`} vs ${game.B.name ? tools.colourize(game.B.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room} join ${id} Black">Black</button>`} ${game.started ? `<button name="send" value ="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room} spectate ${id}">Watch</button> ` : ''}(#${id})`;
				}).join('<br/>')}<hr />`;
				const staffHTML = `<hr />${Object.keys(othello).map(id => {
					const game = othello[id];
					// eslint-disable-next-line max-len
					return `${game.W.name ? tools.colourize(game.W.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room} join ${id} White">White</button>`} vs ${game.B.name ? tools.colourize(game.B.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room} join ${id} Black">Black</button>`} ${game.started ? `<button name="send" value ="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room} spectate ${id}">Watch</button> ` : ''}${tools.hasPermission(by, 'gamma', room) ? `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room} end ${id}">End</button> <button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}othello ${room} stash ${id}">Stash</button>` : ''}(#${id})`;
				}).join('<br/>')}<hr />`;
				if (isPM === 'export') return [html, staffHTML];
				if (tools.hasPermission(by, 'gamma', room) && !isPM) {
					Bot.say(room, `/adduhtml OTHELLOMENU,${html}`);
					Bot.say(room, `/changerankuhtml +, OTHELLOMENU, ${staffHTML}`);
				} else Bot.say(room, `/sendprivatehtmlbox ${by}, ${html}`);
				break;
			}
			case 'resign': case 'forfeit': case 'f': case 'ff': case 'ihavebeenpwned': case 'bully': {
				if (!Bot.rooms[room].othello) return Bot.roomReply(room, by, 'There isn\'t an active Othello game in this room.');
				args.shift();
				let id;
				const user = toID(by);
				if (args.length) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].othello).length === 1) id = Object.keys(Bot.rooms[room].othello)[0];
				else id = Object.keys(Bot.rooms[room].othello).find(k => {
					const game = Bot.rooms[room].othello[k];
					return game && game.started && [game.W.id, game.B.id].includes(user);
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].othello[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (!game.started) return Bot.roomReply(room, by, '>resigning before it starts');
				if (![game.W.id, game.B.id].includes(user)) return Bot.roomReply(room, by, "Only a id can resign.");
				const side = game.W.id === user ? 'W' : 'B';
				if (!game[side].isResigning) {
					Bot.roomReply(room, by, 'Are you sure you want to resign? If you are, use this command again.');
					return game[side].isResigning = true;
				}
				clearGameTimer(game);
				runMoves('resign', side, game);
				break;
			}
			case 'spectate': case 's': case 'watch': case 'w': {
				if (!Bot.rooms[room].othello) return Bot.roomReply(room, by, 'This room does not have any Othello games.');
				args.shift();
				let id;
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].othello).length === 1) id = Object.keys(Bot.rooms[room].othello)[0];
				else if (Object.values(Bot.rooms[room].othello).filter(game => game.started).length === 1) {
					id = Object.values(Bot.rooms[room].othello).filter(game => game.started)[0].id;
				} else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "Sorry, specify the players again?");
					id = Object.keys(Bot.rooms[room].othello).find(k => {
						const game = Bot.rooms[room].othello[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id) && !game.spectators.includes(toID(by))) {
							return true;
						}
					});
				}
				const game = Bot.rooms[room].othello[id];
				if (!game) return Bot.roomReply(room, by, "Sorry, no Othello game here to spectate.");
				if (!game.started) Bot.roomReply(room, by, "Oki, I'll send you the board when it starts.");
				const user = toID(by);
				if ([game.W.id, game.B.id].includes(user)) return Bot.roomReply(room, by, "Imagine spectating your own game.");
				if (!game.spectators.includes(user)) game.spectators.push(user);
				// eslint-disable-next-line max-len
				Bot.say(room, `/sendhtmlpage ${by}, Othello + ${room} + ${id}, <center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`);
				Bot.roomReply(room, by, `You are now spectating the Othello match between ${game.W.name} and ${game.B.name}!`);
				break;
			}
			case 'unspectate': case 'us': case 'unwatch': case 'uw': case 'zestoflifeisstinky': {
				if (!Bot.rooms[room].othello) return Bot.roomReply(room, by, 'This room does not have any Othello games.');
				args.shift();
				let id;
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.values(Bot.rooms[room].othello).filter(game => game.spectators.includes(toID(by))).length === 1) {
					id = Object.values(Bot.rooms[room].othello).filter(game => game.spectators.includes(toID(by)))[0].id;
				} else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "Sorry, didn't get the game you meant.");
					id = Object.keys(Bot.rooms[room].othello).find(k => {
						const game = Bot.rooms[room].othello[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id) && game.spectators.includes(toID(by))) {
							return true;
						}
					});
				}
				const game = Bot.rooms[room].othello[id];
				if (!game) return Bot.roomReply(room, by, "Sorry, no Othello game here to unspectate.");
				if (!game.started) return Bot.roomReply(room, by, "AYAYAYA - no.");
				const user = toID(by);
				if ([game.W.id, game.B.id].includes(user)) return Bot.roomReply(room, by, "Imagine unspectating your own game.");
				if (!game.spectators.includes(user)) {
					// eslint-disable-next-line max-len
					return Bot.roomReply(room, by, `You aren't spectating! If you want to, use \`\`${prefix}othello spectate\`\` instead!`);
				}
				game.spectators.remove(user);
				Bot.roomReply(room, by, `You are no longer spectating the Othello match between ${game.W.name} and ${game.B.name}.`);
				break;
			}
			case 'rejoin': case 'rj': {
				const games = Bot.rooms[room].othello;
				if (!games) return Bot.roomReply(room, by, "Sorry, no Othello game here to spectate.");
				const user = toID(by);
				const ids = Object.keys(games)
					.filter(key => [games[key].W.id, games[key].B.id, ...games[key].spectators].includes(user));
				if (!ids.length) return Bot.roomReply(room, by, "Couldn't find any games for you to rejoin.");
				ids.forEach(id => {
					const game = games[id];
					let side;
					if (game.W.id === user) side = 'W';
					if (game.B.id === user) side = 'B';
					if (!game.started) return;
					if (!side && !game.spectators.includes(toID(by))) {
						// eslint-disable-next-line max-len
						return Bot.roomReply(room, by, `You don't look like a id / spectator - try ${prefix}othello spectate ${id}... ;-;`);
					}
					if (game.spectators.includes(user)) {
						// eslint-disable-next-line max-len
						Bot.say(room, `/sendhtmlpage ${by}, Othello + ${room} + ${id}, <center><h1>${game[game.turn].name}'s Turn (${game.turn})</h1>${game.boardHTML()}</center>`);
					} else {
						// eslint-disable-next-line max-len
						Bot.say(room, `/sendhtmlpage ${user}, Othello + ${room} + ${id}, ${game.turn === side ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(true)}</center>`);
					}
				});
				break;
			}
			case 'stash': case 'store': case 'freeze': case 'hold': case 'h': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].othello) return Bot.roomReply(room, by, 'This room does not have any Othello games.');
				args.shift();
				let id;
				if (!Object.keys(Bot.rooms[room].othello).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].othello).length === 1) id = Object.keys(Bot.rooms[room].othello)[0];
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, unxa);
					id = Object.keys(Bot.rooms[room].othello).find(k => {
						const game = Bot.rooms[room].othello[k];
						if (cargs.includes(game.W.id) && cargs.includes(game.B.id)) return true;
					});
				}
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].othello[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				Bot.say(room, `The Othello match between ${game.W.name} and ${game.B.name} has been put on hold!`);
				delete Bot.rooms[room].othello[id];
				break;
			}
			default: {
				Bot.roomReply(room, by, `That, uhh, doesn't seem to be something I recognize?`);
				break;
			}
		}
	}
};
