// UGOCODE
/*
const gameLimit = 1000;
const pointsLimit = 20;
const gameName = 'battleship';
const gameTitle = 'Battleship';
const pointsWin = 8;
const pointsLose = 5;
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

function sendEmbed (room, winner, players, boards) {
	if (!['boardgames'].includes(room)) return;
	const Embed = require('discord.js').MessageEmbed, embed = new Embed();
	function cellEmoji (cell) {
		if (cell === null) return '🟦';
		if (cell === false) return '⬜';
		if (cell.destroyed) return '🔴';
		return '⬛';
	}
	embed.setColor('#01AAD6').setAuthor('Battleship - Room Match').setTitle((winner === 'A' ? `**${players.A}**` : players.A) + ' vs ' + (winner === 'B' ? `**${players.B}**` : players.B));
	embed.addFields(boards.map(board => ({ name: '\u200b', value: board.map(row => row.map(cellEmoji).join('')).join('\n'), inline: true })));
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
			runMoves('shipmenu', { side }, game);
			if (game.A.id && game.B.id) return Bot.say(room, `/changeuhtml BATTLESHIP-${id},<hr/>${[game.A.name, game.B.name].map(n => tools.colourize(n)).join(' and ')} are currently placing their ships!<hr/>`);
			const html = `<hr/><h1>Battleship Signups are active!</h1>${['A', 'B'].filter(side => !game[side].id).map(side => `<button name="send" style="width:50px" value="/botmsg ${Bot.status.nickName}, ${prefix}battleship ${room}, join ${id} ${side === 'A' ? 'A' : 'B'}">${side === 'A' ? 'A' : 'B'}</button>`).join('&nbsp;')}<hr/>`;
			return Bot.say(room, `/adduhtml BATTLESHIP-${id}, ${html}`);
			break;
		}
		case 'shipmenu': {
			const { side } = info;
			const pre = info.pre || {};
			const HTML = `<center><h1>Please place your ships!</h1><br/>${game.boardHTML('A', false)[0]}<br/><form data-submitsend="/msgroom ${room},/botmsg ${Bot.status.nickName},${prefix}battleship ${room} mock ${id} {sp1}-{sp2}|{ss1}-{ss2}|{sd1}-{sd2}|{sb1}-{sb2}|{sc1}-{sc2}"><table><tr><td>Patrol (2):</td><td><input type="text" name="sp1" style="width:20px"${pre.sp1 ? `value="${pre.sp1}"` : ''}> - <input type="text" name="sp2" style="width:20px"${pre.sp2 ? `value="${pre.sp2}"` : ''}></td></tr><tr><td>Submarine (3):</td><td><input type="text" name="ss1" style="width:20px"${pre.ss1 ? `value="${pre.ss1}"` : ''}> - <input type="text" name="ss2" style="width:20px"${pre.ss2 ? `value="${pre.ss2}"` : ''}></td></tr><tr><td>Destroyer (3):</td><td><input type="text" name="sd1" style="width:20px"${pre.sd1 ? `value="${pre.sd1}"` : ''}> - <input type="text" name="sd2" style="width:20px"${pre.sd2 ? `value="${pre.sd2}"` : ''}></td></tr><tr><td>Battleship (4):</td><td><input type="text" name="sb1" style="width:20px"${pre.sb1 ? `value="${pre.sb1}"` : ''}> - <input type="text" name="sb2" style="width:20px"${pre.sb2 ? `value="${pre.sb2}"` : ''}></td></tr><tr><td>Carrier (5):</td><td><input type="text" name="sc1" style="width:20px"${pre.sc1 ? `value="${pre.sc1}"` : ''}> - <input type="text" name="sc2" style="width:20px"${pre.sc2 ? `value="${pre.sc2}"` : ''}></td></tr></table><br/><input type="submit" value="Preview!"></form><br/><small>Note: Please put the letter first in each, eg: Destroyer: A7 - A8</small></center>`;
			Bot.say(room, `/sendhtmlpage ${game[side].id}, Battleship + ${room} + ${id}, ${HTML}`);
			break;
		}
		case 'shippreview': {
			const { side, html } = info;
			const HTML = `<center><h1>Would you like to proceed with the below layout?</h1><br/><br/>${html}</br><br/><button name="send" value="/msgroom ${room},/botmsg ${Bot.status.nickName},${prefix}battleship ${room} confirmlayout ${id}">Proceed</button>&nbsp;&nbsp;<button name="send" value="/msgroom ${room},/botmsg ${Bot.status.nickName},${prefix}battleship ${room} cancellayout ${id}">Back</button></center>`;
			Bot.say(room, `/sendhtmlpage ${game[side].id}, Battleship + ${room} + ${id}, ${HTML}`);
			break;
		}
		case 'start': {
			game.started = true;
			Bot.say(room, `Battleship: ${game.A.name} vs ${game.B.name} GOGO (${game[game.turn].name} starts)`);
			game.spectators.forEach(spect => Bot.say(room, `/sendhtmlpage ${spect}, Battleship + ${room} + ${id},<center><h1>${game[game.turn].name}'s Turn</h1>${game.boardHTML().map(boards => boards[0]).map((board, i) => {
				return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
			}).join('')}</center>`));
			Bot.say(room, `/sendhtmlpage ${game.A.id}, Battleship + ${room} + ${id}, ${game.turn === 'A' ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML('A', game.turn === 'A').join('<br/><br/>')}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Battleship + ${room} + ${id}, ${game.turn === 'B' ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML('B', game.turn === 'B').join('<br/><br/>')}</center>`);
			setTimeout(() => {
				Bot.say(room, `/highlighthtmlpage ${game.A.id}, Battleship + ${room} + ${id}, Your turn!`);
			}, 1000);
			Bot.say(room, `/adduhtml BATTLESHIP-${id},<hr />${tools.colourize(game.A.name)} vs ${tools.colourize(game.B.name)}! <div style="text-align: right; display: inline-block; font-size: 0.9em; float: right;"><button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}battleship ${room} spectate ${id}">Watch!</button></div><hr />`);
			break;
		}
		case 'move': {
			game.spectators.forEach(spect => Bot.say(room, `/sendhtmlpage ${spect}, Battleship + ${room} + ${id},<center><h1>${game[game.turn].name}'s Turn</h1>${game.boardHTML().map(boards => boards[0]).map((board, i) => {
				return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
			}).join('')}</center>`));
			Bot.say(room, `/sendhtmlpage ${game.A.id}, Battleship + ${room} + ${id}, ${game.turn === 'A' ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML('A', game.turn === 'A').join('<br/><br/>')}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Battleship + ${room} + ${id}, ${game.turn === 'B' ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML('B', game.turn === 'B').join('<br/><br/>')}</center>`);
			setTimeout(() => {
				Bot.say(room, `/highlighthtmlpage ${game[game.turn].id}, Battleship + ${room} + ${id}, Your turn!`);
			}, 1000);
			break;
		}
		case 'end': {
			clearGameTimer(game);
			const players = { A: game.A.name, B: game.B.name }, boards = [game.A.board, game.B.board], winner = info;
			fs.unlink(`./data/BACKUPS/battleship-${room}-${id}.json`, e => {});
			Bot.say(room, `/adduhtml BATTLESHIP-${Date.now()},<center>${game.boardHTML().map(boards => boards[1]).map((board, i) => {
				return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
			}).join('')}</center>`);
			game.spectators.forEach(spect => Bot.say(room, `/sendhtmlpage ${spect}, Battleship + ${room} + ${id}, <center><h1>Game over!</h1>${game.boardHTML().map(boards => boards[1]).map((board, i) => {
				return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
			}).join('')}</center>`));
			Bot.say(room, `/sendhtmlpage ${game.A.id}, Battleship + ${room} + ${id}, <center><h1>Game over!</h1>${game.boardHTML().map(boards => boards[1]).map((board, i) => {
				return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
			}).join('')}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Battleship + ${room} + ${id}, <center><h1>Game over!</h1>${game.boardHTML().map(boards => boards[1]).map((board, i) => {
				return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
			}).join('')}</center>`);
			Bot.say(room, winner ? `${game[winner].name} (${winner === 'A' ? 'A' : 'B'}) won!` : 'The game ended as a draw!');
			delete Bot.rooms[room].battleship[id];
			sendEmbed(room, winner, players, boards);
			return;
			break;
		}
		case 'resign': {
			clearGameTimer(game);
			const loser = info, players = { A: game.A.name, B: game.B.name }, boards = [game.A.board, game.B.board], winner = loser === 'A' ? 'B' : 'A';
			fs.unlink(`./data/BACKUPS/battleship-${room}-${id}.json`, e => {});
			Bot.say(room, `/adduhtml BATTLESHIP-${Date.now()},<center>${game.boardHTML().map(boards => boards[1]).map((board, i) => {
				return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
			}).join('')}</center>`);
			game.spectators.forEach(spect => Bot.say(room, `/sendhtmlpage ${spect}, Battleship + ${room} + ${id}, <center><h1>Resigned.</h1>${game.boardHTML().map(boards => boards[1]).map((board, i) => {
				return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
			}).join('')}</center>`));
			Bot.say(room, `/sendhtmlpage ${game.A.id}, Battleship + ${room} + ${id}, <center><h1>Resigned.</h1>${game.boardHTML().map(boards => boards[1]).map((board, i) => {
				return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
			}).join('')}</center>`);
			Bot.say(room, `/sendhtmlpage ${game.B.id}, Battleship + ${room} + ${id}, <center><h1>Resigned.</h1>${game.boardHTML().map(boards => boards[1]).map((board, i) => {
				return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
			}).join('')}</center>`);
			Bot.say(room, `${players[winner]} won by forfeit!`);
			delete Bot.rooms[room].battleship[id];
			sendEmbed(room, winner, players, boards);
			return;
			break;
		}
	}
	fs.writeFile(`./data/BACKUPS/battleship-${room}-${id}.json`, JSON.stringify(game), e => {
		if (e) console.log(e);
	});
}

module.exports = {
	help: `Battleship! Guide (courtesy the room bully, Audiino): https://docs.google.com/document/u/1/d/e/2PACX-1vQe3qI62kQaDOg01mTYyxKLvL6rAy9A3IX9oFmRCxdVG4W0qbQvLhc_XPmvk6lNu3ZRete18L80UL0x/pub`,
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
				if (!Bot.rooms[room].battleship) Bot.rooms[room].battleship = {};
				const id = Date.now();
				Bot.rooms[room].battleship[id] = GAMES.create('battleship', id, room, {});
				Bot.say(room, `/adduhtml BATTLESHIP-${id}, <hr/><h1>Battleship Signups have begun!</h1><button name="send" style="width:50px" value="/botmsg ${Bot.status.nickName}, ${prefix}battleship ${room}, join ${id} A">A</button>&nbsp;&nbsp;<button name="send" style="width:50px" value="/botmsg ${Bot.status.nickName}, ${prefix}battleship ${room}, join ${id} B">B</button><hr/>`);
				Bot.say(room, '/notifyrank all, Battleship, A new game of Battleship has been created!,battleshipsignup');
				return;
				break;
			}
			case 'join': case 'j': {
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'There isn\'t an active Battleship game in this room.');
				if (!args[1]) return Bot.roomReply(room, by, 'Please specify the ID / side.');
				let id, side, user = toID(by), rand = false;
				if (args[2] && parseInt(args[1])) {
					id = args[1];
					side = args[2].toUpperCase();
					if (side === 'ANY') {
						side = ['A', 'B'].random();
						rand = true;
					}
					if (!['A', 'B'].includes(side)) return Bot.roomReply(room, by, "I only accept A and B. (insert snarky comment)");
				} else if (Object.keys(Bot.rooms[room].battleship).length === 1) {
					id = Object.keys(Bot.rooms[room].battleship)[0];
					side = args[1].toUpperCase();
					if (side === 'ANY') {
						side = ['A', 'B'].random();
						rand = true;
					}
					if (!['A', 'B'].includes(side)) return Bot.roomReply(room, by, "I only accept A and B. (insert snarky comment)");
				} else {
					side = args[1].toUpperCase();
					if (side === 'ANY') {
						side = ['A', 'B'].random();
						rand = true;
					}
					if (!['A', 'B'].includes(side)) return Bot.roomReply(room, by, "I only accept A and B. (insert snarky comment)");
					id = Object.keys(Bot.rooms[room].battleship).find(k => {
						const game = Bot.rooms[room].battleship[k];
						return game && !game.started && !game[side].id;
					});
					if (!id) return Bot.roomReply(room, by, "Sorry, unable to find any open games.");
				}
				const game = Bot.rooms[room].battleship[id];
				if (!game) return Bot.roomReply(room, by, "Nope. BOOP");
				if (game.started) return Bot.roomReply(room, by, 'Too late!');
				if (game[side].id) return Bot.roomReply(room, by, "Sorry, already taken!");
				const other = side === 'A' ? 'B' : 'A';
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
				Bot.say(room, `${by.substr(1)} joined Battleship (#${id}) as player ${side === 'A' ? 'A' : 'B'}!${rand ? ' (random)' : ''}`);
				runMoves('join', { user: by.substr(1), side: side }, game);
				break;
			}
			case 'mock': case 'place': case 'placeships': {
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'There isn\'t an active Battleship game in this room.');
				if (!args[1]) return Bot.roomReply(room, by, unxa);
				args.shift();
				if (!Object.keys(Bot.rooms[room].battleship).length) return Bot.roomReply(room, by, "No games are active.");
				let id, user = toID(by);
				if (args[0] && /^\d+$/.test(args[0].trim())) id = args.shift().trim();
				else id = Object.keys(Bot.rooms[room].battleship).find(k => {
					const game = Bot.rooms[room].battleship[k];
					return game && game.started && !game[game.turn].id === user;
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].battleship[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (game.started) return Bot.roomReply(room, by, `OI IT'S ALREADY STARTED!`);
				const U = [game.A, game.B].find(u => u.id === user);
				if (U.set) return Bot.roomReply(room, by, `You've already set your layout!`);
				const places = args.join('').toLowerCase().replace(/[^a-z0-9\-\|]/g, '').split('|').map(cell => cell.split('-'));
				if (places.length !== 5) return Bot.roomReply(room, by, `I need 5 ships, not ${places.length}`);
				if (places.find(place => place.length !== 2)) return Bot.roomReply(room, by, `A ship needs 2 places...`);
				const ships = Object.keys(game.ships);
				const inputShips = Object.fromEntries(places.map(place => [ships.shift(), place]));
				game.validShips(inputShips).then(board => {
					U.tempInput = inputShips;
					runMoves('shippreview', { side: U.label, html: game.givenBoardHTML(board) }, game);
				}).catch(err => {
					Bot.roomReply(room, by, err.message);
					const labels = ['sp1', 'sp2', 'ss1', 'ss2', 'sd1', 'sd2', 'sb1', 'sb2', 'sc1', 'sc2'];
					runMoves('shipmenu', { side: U.label, pre: Object.fromEntries(places.flat().map(place => [labels.shift(), place])) }, game);
				});
				break;
			}
			case 'confirmlayout': {
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'There isn\'t an active Battleship game in this room.');
				args.shift();
				if (!Object.keys(Bot.rooms[room].battleship).length) return Bot.roomReply(room, by, "No games are active.");
				let id, user = toID(by);
				if (args[0] && /^\d+$/.test(args[0].trim())) id = args.shift().trim();
				else id = Object.keys(Bot.rooms[room].battleship).find(k => {
					const game = Bot.rooms[room].battleship[k];
					return game && game.started && !game[game.turn].id === user;
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].battleship[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (game.started) return Bot.roomReply(room, by, `OI IT'S ALREADY STARTED!`);
				const U = [game.A, game.B].find(u => u.id === user);
				if (U.set) return Bot.roomReply(room, by, `You've already set your layout!`);
				if (!U.tempInput) return runMoves('shipmenu', { side: U.label }, game);
				game.setShips(U.tempInput, U.label).then(() => {
					U.set = true;
					Bot.say(room, `${by.substr(1)} has set their ships!`);
					if (game.A.set && game.B.set) runMoves('start', {}, game);
					else Bot.say(room, `/sendhtmlpage ${by}, Battleship + ${room} + ${id}, <center><h1>Waiting for opponent...</h1>${game.boardHTML(U.label, false).join('<br/><br/>')}</center>`);
				}).catch(e => {
					Bot.roomReply(room, by, e.message);
				});
				break;
			}
			case 'cancellayout': {
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'There isn\'t an active Battleship game in this room.');
				args.shift();
				if (!Object.keys(Bot.rooms[room].battleship).length) return Bot.roomReply(room, by, "No games are active.");
				let id, user = toID(by);
				if (args[0] && /^\d+$/.test(args[0].trim())) id = args.shift().trim();
				else id = Object.keys(Bot.rooms[room].battleship).find(k => {
					const game = Bot.rooms[room].battleship[k];
					return game && game.started && !game[game.turn].id === user;
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].battleship[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (game.started) return Bot.roomReply(room, by, `OI IT'S ALREADY STARTED!`);
				const U = [game.A, game.B].find(u => u.id === user);
				if (U.set) return Bot.roomReply(room, by, `You've already set your layout!`);
				const labels = ['sp1', 'sp2', 'ss1', 'ss2', 'sd1', 'sd2', 'sb1', 'sb2', 'sc1', 'sc2'];
				const places = Object.values(U.tempInput).flat().map(t => t.toUpperCase());
				runMoves('shipmenu', { side: U.label, pre: Object.fromEntries(places.flat().map(place => [labels.shift(), place])) }, game);
				break;
			}
			case 'attack': case 'play': case 'move': case 'click': case 'fire': {
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'There isn\'t an active Battleship game in this room.');
				if (!args[1]) return Bot.roomReply(room, by, unxa);
				args.shift();
				if (!Object.keys(Bot.rooms[room].battleship).length) return Bot.roomReply(room, by, "No games are active.");
				let id, user = toID(by);
				if (args[0] && /^\d+$/.test(args[0].trim())) id = args.shift().trim();
				else id = Object.keys(Bot.rooms[room].battleship).find(k => {
					const game = Bot.rooms[room].battleship[k];
					return game && game.started && !game[game.turn].id === user;
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].battleship[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (!game.started) return Bot.roomReply(room, by, 'OI, IT HASN\'T STARTED!');
				if (!(game[game.turn].id === toID(by))) return;
				let coords = args.join('').split(',');
				if (coords.length !== 2) return Bot.roomReply(room, by, "I need two coordinates to play - why not click on the board instead?");
				coords = coords.map(t => parseInt(toID(t)));
				if (isNaN(coords[0]) || isNaN(coords[1])) return Bot.roomReply(room, by, "Invalid coordinates. ;-;");
				const side = game.A.id === user ? 'A' : 'B';
				game.attack(side, coords).then(res => {
					delete game.A.isResigning;
					delete game.B.isResigning;
					clearGameTimer(game);
					Bot.say(room, `/adduhtml Battleship-log-${room}-${id},<hr/>${tools.colourize(by.substr(1))} ${res ? `hit the ${res.ship}${res.ko ? ' and knocked it out!' : '!'}` : 'missed.'}<hr/>`);
					if (res.over) {
						// UGOCODE
						/*
						if (UGOR(room)) {
							const played = Number(Bot.UGO.get(user)?.[gameName]);
							if (played <= pointsLimit) awardUGOPoints(pointsWin, [toID(game[res.over].name)]);
							awardUGOPoints(pointsLose, [game[game.other(res.over)].name]);
						}
						*/
						// ENDUGOCODE
						runMoves('end', res.over, game);
					} else {
						gameTimer(game, game[game.other(side)].name);
						runMoves('move', null, game);
					}
				}).catch(err => {
					Bot.roomReply(room, by, err.message);
				});
				break;
			}
			case 'substitute': case 'sub': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'This room does not have any Battleship games.');
				args.shift();
				let id, cargs;
				if (!Object.keys(Bot.rooms[room].battleship).length) return Bot.roomReply(room, by, "No games are active.");
				if (/^[^a-zA-Z]+$/.test(args[0])) id = toID(args.shift());
				else if (Object.keys(Bot.rooms[room].battleship).length === 1) id = Object.keys(Bot.rooms[room].battleship)[0];
				else {
					cargs = args.join(' ').split(/\s*,\s*/);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "I NEED TWO NAMES GIVE ME TWO NAMES");
					const id1 = toID(cargs[0]), id2 = toID(cargs[1]);
					id = Object.keys(Bot.rooms[room].battleship).find(k => {
						const game = Bot.rooms[room].battleship[k], ps = [game.A.id, game.B.id];
						return game && game.started && (ps.includes(id1) && !ps.includes(id2) || !ps.includes(id1) && ps.includes(id2));
					});
				}
				cargs = args.join(' ').replace(/[<>]/g, '').split(/\s*,\s*/);
				if (cargs.length !== 2) return Bot.roomReply(room, by, "I NEED TWO NAMES GIVE ME TWO NAMES");
				if (!id) return Bot.roomReply(room, by, "Sorry, I couldn't find a valid game to sub.");
				const game = Bot.rooms[room].battleship[id];
				if (!game.A.id || !game.B.id) return Bot.roomReply(room, by, 'Excuse me?');
				cargs = cargs.map(carg => carg.trim());
				const users = cargs.map(carg => toID(carg));
				if (users.includes(game.A.id) && users.includes(game.B.id) || !users.includes(game.A.id) && !users.includes(game.B.id)) return Bot.say(room, 'Those users? Something\'s wrong with those...');
				if ([game.A.id, game.B.id].includes(toID(by)) && !tools.hasPermission(by, 'coder')) return Bot.say(room, "Hah! Can't sub yourself out."); // UGOCODE beta -> coder
				// UGOCODE
				/*
				if (UGOR(room)) {
					const coming = users.find(u => ![game.A.id, game.B.id].includes(u)), going = users.find(u => [game.A.id, game.B.id].includes(u));
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
				// ENDUGOCODE
				*/
				let subbed, ex, add;
				if (users.includes(game.A.id)) {
					subbed = 'A';
					if (users[0] == game.A.id) {
						Bot.say(room, `${game.A.name} was subbed with ${cargs[1]}!`);
						game.A.id = users[1];
						game.A.name = cargs[1];
						ex = users[0];
						add = users[1];
					} else {
						Bot.say(room, `${game.A.name} was subbed with ${cargs[0]}!`);
						game.A.id = users[0];
						game.A.name = cargs[0];
						ex = users[1];
						add = users[0];
					}
				} else {
					subbed = 'B';
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
				game.spectators.remove(add);
				game.spectators.push(ex);
				if (game.started) runMoves('move', null, game);
				else runMoves('shipmenu', { side: subbed }, game);
				break;
			}
			case 'end': case 'e': {
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'This room does not have any Battleship games.');
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				args.shift();
				let id;
				if (!Object.keys(Bot.rooms[room].battleship).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].battleship).length === 1) id = Object.keys(Bot.rooms[room].battleship)[0];
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, unxa);
					id = Object.keys(Bot.rooms[room].battleship).find(k => {
						const game = Bot.rooms[room].battleship[k];
						if (cargs.includes(game.A.id) && cargs.includes(game.B.id)) return true;
					});
				}
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].battleship[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				if (!game.started) Bot.say(room, `/changeuhtml BATTLESHIP-${id}, <hr/>Ended. :(<hr/>`);
				clearGameTimer(game);
				// UGOCODE
				/*
				if (UGOR(room)) {
					const users = [game.A.id, game.B.id].filter(t => t);
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
				delete Bot.rooms[room].battleship[id];
				fs.unlink(`./data/BACKUPS/battleship-${room}-${id}.json`, () => {});
				return Bot.say(room, `Welp, ended Battleship#${id}.`);
				break;
			}
			case 'endf': case 'ef': {
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'This room does not have any Battleship games.');
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				args.shift();
				const [id, winner] = args.join('').split(',').map(toID);
				if (!Object.keys(Bot.rooms[room].battleship).length) return Bot.roomReply(room, by, "No games are active.");
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].battleship[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				if (!game.started) {
					// UGOCODE
					/*
					if (UGOR(room)) {
						const users = [game.A.id, game.B.id].filter(t => t);
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
					fs.unlink(`./data/BACKUPS/battleship-${room}-${id}.json`, () => {});
					return Bot.say(room, `/changeuhtml BATTLESHIP-${id}, <hr/>Ended. :(<hr/>`);
				} else if (!winner || ![game.A.id, game.B.id].includes(winner)) return Bot.roomReply(room, by, `W-who won, again?`);
				clearGameTimer(game);
				if (toID(by) === winner) return Bot.roomReply(room, by, 'Only I may be corrupt');
				if (game.started) {
					// UGOCODE
					/*
					if (UGOR(room)) {
						const played = Number(Bot.UGO.get(winner)?.[gameName]);
						if (played <= pointsLimit) awardUGOPoints(pointsWin, [winner]);
						awardUGOPoints(pointsLose, [game.A.id === winner ? game.B.id : game.A.id].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
					}
					*/
					// ENDUGOCODE
				}
				runMoves('end', winner === game.A.id ? 'A' : 'B', game);
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
					const games = files.filter(file => file.startsWith(`battleship-${room}-`)).map(file => file.slice(0, -4)).map(file => file.replace(/[^0-9]/g, ''));
					if (games.length) {
						Bot.say(room, `/adduhtml BATTLESHIPBACKUPS, <details><summary>Game Backups</summary><hr />${games.map(game => {
							try {
								const info = require(`../../data/BACKUPS/battleship-${room}-${game}.json`);
								return `<button name="send" value="/botmsg ${Bot.status.nickName},${prefix}battleship ${room} restore ${game}">${info.A.name} vs ${info.B.name}</button>`;
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
				if (Bot.rooms[room].battleship?.[id]) return Bot.roomReply(room, by, "Sorry, that game is already in progress!");
				fs.readFile(`./data/BACKUPS/battleship-${room}-${id}.json`, 'utf8', (err, file) => {
					if (err) return Bot.say(room, "Sorry, couldn't find that game!");
					if (!Bot.rooms[room].battleship) Bot.rooms[room].battleship = {};
					Bot.rooms[room].battleship[id] = GAMES.create('battleship', id, room, JSON.parse(file));
					Bot.say(room, "Game has been restored!");
					const game = Bot.rooms[room].battleship[id];
					runMoves('move', null, game);
				});
				return;
				break;
			}
			case 'menu': case 'm': case 'list': case 'l': case 'players': {
				const battleship = Bot.rooms[room].battleship;
				if (!battleship || !Object.keys(battleship).length) {
					if (tools.hasPermission(by, 'gamma', room) && !isPM) return Bot.say(room, "Sorry, no games found.");
					return Bot.roomReply(room, by, "Sorry, no games found.");
				}
				const html = `<hr />${Object.keys(battleship).map(id => {
					const game = battleship[id];
					return `${game.A.name ? tools.colourize(game.A.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}battleship ${room} join ${id} A">A</button>`} vs ${game.B.name ? tools.colourize(game.B.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}battleship ${room} join ${id} B">B</button>`} ${game.started ? `<button name="send" value ="/msg ${Bot.status.nickName}, ${prefix}battleship ${room} spectate ${id}">Watch</button> ` : ''}(#${id})`;
				}).join('<br/>')}<hr />`;
				const staffHTML = `<hr />${Object.keys(battleship).map(id => {
					const game = battleship[id];
					return `${game.A.name ? tools.colourize(game.A.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}battleship ${room} join ${id} A">A</button>`} vs ${game.B.name ? tools.colourize(game.B.name) : `<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}battleship ${room} join ${id} B">B</button>`} ${game.started ? `<button name="send" value ="/msg ${Bot.status.nickName}, ${prefix}battleship ${room} spectate ${id}">Watch</button> ` : ''}<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}battleship ${room} end ${id}">End</button> <button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}battleship ${room} stash ${id}">Stash</button>(#${id})`;
				}).join('<br/>')}<hr />`;
				if (isPM === 'export') return [html, staffHTML];
				if (tools.hasPermission(by, 'gamma', room) && !isPM) {
					Bot.say(room, `/adduhtml BATTLESHIPMENU,${html}`);
					Bot.say(room, `/changerankuhtml +, BATTLESHIPMENU, ${staffHTML}`);
				} else Bot.say(room, `/sendprivatehtmlbox ${by}, ${html}`);
				break;
			}
			case 'resign': case 'forfeit': case 'f': case 'ff': case 'ihavebeenpwned': case 'bully': {
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'There isn\'t an active Battleship game in this room.');
				args.shift();
				let id, user = toID(by);
				if (args.length) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].battleship).length === 1) id = Object.keys(Bot.rooms[room].battleship)[0];
				else id = Object.keys(Bot.rooms[room].battleship).find(k => {
					const game = Bot.rooms[room].battleship[k];
					return game && game.started && [game.A.id, game.B.id].includes(user);
				});
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you meant to play in.");
				const game = Bot.rooms[room].battleship[id];
				if (!game) return Bot.roomReply(room, by, "Not a valid ID.");
				if (!game.started) return Bot.roomReply(room, by, '>resigning before it starts');
				if (![game.A.id, game.B.id].includes(user)) return Bot.roomReply(room, by, "Only a player can resign.");
				const side = game.A.id === user ? 'A' : 'B';
				if (!game[side].isResigning) {
					Bot.roomReply(room, by, 'Are you sure you want to resign? If you are, use this command again.');
					return game[side].isResigning = true;
				}
				clearGameTimer(game);
				// UGOCODE
				/*
				if (UGOR(room)) {
					const played = Number(Bot.UGO.get(user)?.[gameName]);
					if (played <= pointsLimit) awardUGOPoints(pointsWin, [toID(game[game.other(side)].name)]);
					awardUGOPoints(pointsLose, [game[side].name].filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
				}
				*/
				// ENDUGOCODE
				runMoves('resign', side, game);
				break;
			}
			case 'spectate': case 's': case 'watch': case 'w': {
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'This room does not have any Battleship games.');
				args.shift();
				let id;
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].battleship).length === 1) id = Object.keys(Bot.rooms[room].battleship)[0];
				else if (Object.values(Bot.rooms[room].battleship).filter(game => game.started).length === 1) id = Object.values(Bot.rooms[room].battleship).filter(game => game.started)[0].id;
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "Sorry, specify the players again?");
					id = Object.keys(Bot.rooms[room].battleship).find(k => {
						const game = Bot.rooms[room].battleship[k];
						if (cargs.includes(game.A.id) && cargs.includes(game.B.id) && !game.spectators.includes(toID(by))) return true;
					});
				}
				const game = Bot.rooms[room].battleship[id];
				if (!game) return Bot.roomReply(room, by, "Sorry, no Battleship game here to spectate.");
				if (!game.started) Bot.roomReply(room, by, "Oki, I'll send you the board when it starts.");
				const user = toID(by);
				if ([game.A.id, game.B.id].includes(user)) return Bot.roomReply(room, by, "Imagine spectating your own game.");
				if (!game.spectators.includes(user)) game.spectators.push(user);
				Bot.say(room, `/sendhtmlpage ${by}, Battleship + ${room} + ${id}, <center><h1>${game[game.turn].name}'s Turn</h1>${game.boardHTML().map(boards => boards[0]).map((board, i) => {
					return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
				}).join('')}</center>`);
				return Bot.roomReply(room, by, `You are now spectating the Battleship match between ${game.A.name} and ${game.B.name}!`);
				break;
			}
			case 'unspectate': case 'us': case 'unwatch': case 'uw': case 'zestoflifeisstinky': {
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'This room does not have any Battleship games.');
				args.shift();
				let id;
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.values(Bot.rooms[room].battleship).filter(game => game.spectators.includes(toID(by))).length === 1) id = Object.values(Bot.rooms[room].battleship).filter(game => game.spectators.includes(toID(by)))[0].id;
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, "Sorry, didn't get the game you meant.");
					id = Object.keys(Bot.rooms[room].battleship).find(k => {
						const game = Bot.rooms[room].battleship[k];
						if (cargs.includes(game.A.id) && cargs.includes(game.B.id) && game.spectators.includes(toID(by))) return true;
					});
				}
				const game = Bot.rooms[room].battleship[id];
				if (!game) return Bot.roomReply(room, by, "Sorry, no Battleship game here to unspectate.");
				if (!game.started) return Bot.roomReply(room, by, "AYAYAYA - no.");
				const user = toID(by);
				if ([game.A.id, game.B.id].includes(user)) return Bot.roomReply(room, by, "Imagine unspectating your own game.");
				if (!game.spectators.includes(user)) return Bot.roomReply(room, by, `You aren't spectating! If you want to, use \`\`${prefix}battleship spectate\`\` instead!`);
				game.spectators.remove(user);
				return Bot.roomReply(room, by, `You are no longer spectating the Battleship match between ${game.A.name} and ${game.B.name}.`);
				break;
			}
			case 'rejoin': case 'rj': {
				const games = Bot.rooms[room].battleship;
				if (!games) return Bot.roomReply(room, by, "Sorry, no Battleship game here to spectate.");
				const user = toID(by);
				const ids = Object.keys(games).filter(key => [games[key].A.id, games[key].B.id, ...games[key].spectators].includes(user));
				if (!ids.length) return Bot.roomReply(room, by, "Couldn't find any games for you to rejoin.");
				ids.forEach(id => {
					let game = games[id], side;
					if (game.A.id === user) side = 'A';
					if (game.B.id === user) side = 'B';
					if (!side && !game.spectators.includes(toID(by))) return Bot.roomReply(room, by, `You don't look like a player / spectator - try ${prefix}battleship spectate ${id}... ;-;`);
					if (game.spectators.includes(user)) Bot.say(room, `/sendhtmlpage ${by}, Battleship + ${room} + ${id}, <center><h1>${game[game.turn].name}'s Turn</h1>${game.boardHTML().map(boards => boards[0]).map((board, i) => {
						return `<div style="display:inline-block;padding:10px;">${tools.colourize(game['AB'[i]].name)}<br/><br/>${board}</div>`;
					}).join('')}</center>`);
					else if (game.started) Bot.say(room, `/sendhtmlpage ${game[side].id}, Battleship + ${room} + ${id}, ${game.turn === side ? "<h1 style=\"text-align: center;\">Your turn!</h1>" : "<h1 style=\"text-align: center;\">Waiting for opponent...</h1>"}<center>${game.boardHTML(side, game.turn === side).join('<br/><br/>')}</center>`);
					else runMoves('shipmenu', { side }, game);
				});
				break;
			}
			case 'stash': case 'store': case 'freeze': case 'hold': case 'h': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].battleship) return Bot.roomReply(room, by, 'This room does not have any Battleship games.');
				args.shift();
				let id;
				if (!Object.keys(Bot.rooms[room].battleship).length) return Bot.roomReply(room, by, "No games are active.");
				if (args.length && /^[^a-zA-Z]+$/.test(args.join(''))) id = toID(args.join(''));
				else if (Object.keys(Bot.rooms[room].battleship).length === 1) id = Object.keys(Bot.rooms[room].battleship)[0];
				else {
					const cargs = args.join('').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
					if (cargs.length !== 2) return Bot.roomReply(room, by, unxa);
					id = Object.keys(Bot.rooms[room].battleship).find(k => {
						const game = Bot.rooms[room].battleship[k];
						if (cargs.includes(game.A.id) && cargs.includes(game.B.id)) return true;
					});
				}
				if (!id) return Bot.roomReply(room, by, "Unable to find the game you're talking about. :(");
				const game = Bot.rooms[room].battleship[id];
				if (!game) return Bot.roomReply(room, by, "Invalid ID.");
				Bot.say(room, `The Battleship match between ${game.A.name || '(no one)'} and ${game.B.name || '(no one)'} has been put on hold!`);
				delete Bot.rooms[room].battleship[id];
				break;
			}
			default: {
				Bot.roomReply(room, by, `That, uhh, doesn't seem to be something I recognize?`);
				break;
			}
		}
	}
};
