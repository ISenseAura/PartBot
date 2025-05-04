// UGOCODE
/*
const gameLimit = 1000;
const pointsLimit = 6;
const gameName = 'scrabble';
const gameTitle = 'Scrabble';
const pointsWin = 40;
const pointsLose = 25;
*/

function gameTimer (game, turn) {
	const time = 120;
	if (!Bot.rooms[game.room]) return;
	if (!Bot.rooms[game.room].gameTimers) Bot.rooms[game.room].gameTimers = {};
	const gameTimers = Bot.rooms[game.room].gameTimers;
	clearTimeout(gameTimers[game.id]);
	// TODO: (For all games) Make timer mention game
	gameTimers[game.id] = setTimeout(() => Bot.say(game.room, `${turn} hasn't played for the past ${time} seconds...`), time * 1000);
}

function clearGameTimer (game) {
	clearTimeout(Bot.rooms[game.room]?.gameTimers?.[game.id]);
}

/*
function endUGOgame ($) {
	if ($.placed.flat().filter(c => c).length < 30) {
		Object.keys($.players).forEach(p => Bot.say($.room, `The game was ended early and will not count towards the limit.`));
		const users = Object.keys($.players);
		const UGODB = Bot.UGO.object();
		users.forEach(u => {
			u = toID(u);
			const userGames = (UGODB[u] || {});
			userGames[gameName] = userGames[gameName] ? userGames[gameName] - 1 : 0;
		});
	} else {
		const pointUsers = Object.values($.players).sort((a, b) => b.score - a.score).map(p => p.id);
		const winner = pointUsers.shift();
		awardUGOPoints(pointsWin, [winner].filter(p => Number(Bot.UGO.get(p)?.[gameName]) <= pointsLimit));
		awardUGOPoints(pointsLose, pointUsers.filter(p => Number(Bot.UGO.get(p)?.[gameName]) <= pointsLimit));
	}
}
*/

module.exports = {
	help: `Scrabble! \`\`${prefix}scrabble new\`\`, \`\`${prefix}scrabble join\`\`, and \`\`${prefix}scrabble start\`\``,
	permissions: 'none',
	findGame: (by, context, games, type) => {
		by = toID(by);
		if (context && games[context]) return games[context];
		if (~~context) return null;
		const gs = Object.values(games);
		if (gs.length === 1) return gs[0];
		const cargs = (context || '').toString().split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/).map(toID);
		if (type !== 'sub' && cargs.length >= 2 && cargs.length <= 4) {
			const fgs = gs.filter(game => !cargs.find(u => !game.players[u]));
			if (fgs.length === 1) return fgs[0];
		}
		switch (type) {
			case 'join': {
				const fgs = gs.filter(game => !game.started && !game.players[by]);
				if (fgs.length === 1) return fgs[0];
				break;
			}
			case 'start': {
				const fgs = gs.filter(game => !game.started);
				if (fgs.length === 1) return fgs[0];
				break;
			}
			case 'gamerule': {
				const fgs = gs.filter(game => !game.placed.flat().find(tile => tile));
				if (fgs.length === 1) return fgs[0];
				break;
			}
			case 'action': {
				const fgs = gs.filter(game => by ? game.players[by] : true);
				if (fgs.length === 1) return fgs[0];
				break;
			}
			case 'watch': {
				const fgs = gs.filter(game => by ? !(game.players[by] || game.spectators.includes(by)) : true);
				if (fgs.length === 1) return fgs[0];
				break;
			}
			case 'unwatch': {
				const fgs = gs.filter(game => by ? game.spectators.includes(by) : true);
				if (fgs.length === 1) return fgs[0];
				break;
			}
			case 'sub': {
				if (cargs.length !== 2) break;
				const fgs = gs.filter(game => {
					return game.players[cargs[0]] && !game.players[cargs[1]] || game.players[cargs[1]] && !game.players[cargs[0]];
				});
				if (fgs.length === 1) return fgs[0];
			}
		}
		return null;
	},
	commandFunction: function (Bot, room, time, by, args, client, isPM) {
		if (!args.length) args.push('help');
		switch (toID(args[0])) {
			case 'help': case 'h': case 'aaaa': {
				// eslint-disable-next-line max-len
				const help = 'The Scrabble module! For Scrabble rules, visit https://scrabble.hasbro.com/en-us/rules. You can play just by clicking on the board and typing your words!';
				if (tools.hasPermission(by, 'gamma', room) && !isPM) Bot.say(room, help);
				else Bot.roomReply(room, by, help);
				break;
			}
			case 'new': case 'n': case 'create': case 'newgame': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (isPM) return Bot.roomReply(room, by, "Do it in the room ya nerd");
				if (!tools.canHTML(room)) return Bot.say(room, `I need * permissions for this`);
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = Bot.rooms[room].scrabble;
				const ID = Date.now();
				$[ID] = GAMES.create('scrabble', ID, room/*, { modded: 'pokemon' }*/); // UGOCODE
				// eslint-disable-next-line max-len
				Bot.say(room, `/adduhtml SCRABBLE-${ID}, <hr><h1>Scrabble Signups have begun!</h1><button name="send" value="/msg ${Bot.status.nickName}, ${prefix}scrabble ${room}, join ${ID}">Join!</button><hr>`);
				Bot.say(room, '/notifyrank all, Scrabble, A new game of Scrabble has been created!,scrabblesignup');
				fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
					if (e) console.log(e);
				});
				break;
			}
			case 'join': case 'j': case 'iwanttoplaytoo': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame(by, args.slice(1).join(' '), Bot.rooms[room].scrabble, 'join');
				if (!$) return Bot.roomReply(room, by, 'No game specified/found');
				const user = toID(by);
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
				$.addPlayer(by.replace(/^[^a-zA-Z0-9]/, '')).then(() => {
					Bot.say(room, `${by.substr(1)} joined the game!`);
					fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
						if (e) console.log(e);
					});
				}).catch(err => Bot.roomReply(room, by, err));
				break;
			}
			case 'leave': case 'l': case 'part': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame(by, args.slice(1).join(' '), Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, 'No game specified/found');
				$.removePlayer(by.replace(/^[^a-zA-Z0-9]/, '')).then(() => {
					// UGOCODE
					/*
					if (UGOR(room)) {
						const users = [by];
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
					Bot.say(room, `${by.substr(1)} left the game!`);
					fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
						if (e) console.log(e);
					});
				}).catch(err => Bot.roomReply(room, by, err));
				break;
			}
			case 'start': case 's': case 'hajime': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame('', args.slice(1).join(' '), Bot.rooms[room].scrabble, 'start');
				if (!$) return Bot.roomReply(room, by, 'No game specified/found');
				$.start().then(() => {
					// eslint-disable-next-line max-len
					Bot.say(room, `/adduhtml SCRABBLE-${$.id},<hr>${tools.listify(Object.values($.players).map(u => tools.colourize(u.name)))}! <div style="text-align: right; display: inline-block; font-size: 0.9em; float: right;"><button name="send" value="/msg ${Bot.status.nickName}, ${prefix}scrabble ${room} spectate ${$.id}">Watch!</button></div><hr>`);
					$.spectators.forEach(u => Bot.say(room, $.HTML(u)));
					Object.keys($.players).forEach(u => Bot.say(room, $.HTML(u)));
					Bot.say(room, $.highlight());
					fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
						if (e) console.log(e);
					});
				}).catch(err => Bot.log(err));
				break;
			}
			case 'play': case 'place': case 'p': case 'click': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame(by, args[1], Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, "Game not found");
				if (!$.isTurn(by)) return Bot.roomReply(room, by, 'Not your turn!');
				if (~~args[1]) args.shift();
				args.shift();
				const coords = args.shift().split(',').map(n => ~~n);
				if (coords.length !== 2) return Bot.roomReply(room, by, "You're supposed to click a tile first");
				const dir = args.shift();
				let down;
				switch (toID(dir || '')[0]) {
					case 'd': down = true; break;
					case 'r': down = false; break;
					default: return Bot.roomReply(room, by, `Direction must be right/down, not ${dir}`);
				}
				const word = args.join('');
				$.play(coords, down, word).then(res => {
					const [name, score, scores, bingo, receivedTiles] = res;
					if (config.extConfig.aegii) {
						try {
							const logStr = `${new Date().toISOString()} | ${$.id} | ${name.padStart(25, ' ')} | ${scores.map(({ word }) => word).join(',').toUpperCase()}\n`;
							fs.appendFileSync(config.extConfig.aegii, logStr);
						} catch (err) {
							Bot.log(err);
						}
					}
					// eslint-disable-next-line max-len
					Bot.say(room, `/adduhtml scrabbleplay${$.id},<hr/>${bingo ? '<b>BINGO!</b> ' : ''}${tools.colourize(name)} scored ${score} (${scores.map(({ score, word }) => `${word} [${score}]`).join(' / ')})<span style="float:right"><button name="send" value="/msg ${Bot.status.nickName},${prefix}scrabble ${room} watch ${$.id}">Watch</button></span><hr/>`);
					if (receivedTiles.includes(' ')) {
						// eslint-disable-next-line max-len
						Bot.roomReply(room, by, `If you want to use one of your blank tiles, then enter the letter you want the blank to be used as followed by a '. For example, if you’re trying to play the word trace and want to use your blank as a C, then you would type TRAC'E into the ‘Type your word here’ box.`);
					}
					if (Object.values($.players).find(player => player.tiles.length === 0)) { // Game ends
						$.ended = true;
						$.deduct();
						// UGOCODE
						// if (UGOR(room)) endUGOgame($);
						// ENDUGOCODE
						$.spectators.forEach(u => Bot.say(room, $.HTML(u)));
						Object.keys($.players).forEach(u => Bot.say(room, $.HTML(u)));
						pName = Object.values($.players).sort((a, b) => b.score - a.score)[0];
						Bot.say(room, `Game ended! ${pName.name} won!`);
						Bot.say(room, `/adduhtml SCRABBLEBOARD${$.id},${$.boardHTML()}`);
						Bot.say(room, `/adduhtml SCRABBLEPOINTS${$.id},${$.pointsHTML()}`);
						if (config.extConfig.aegii) {
							try {
								const logStr = `${new Date().toISOString()} | ${$.id} | ${pName.name.padStart(25, ' ')} >>> WON\n`;
								fs.appendFileSync(config.extConfig.aegii, logStr);
							} catch (err) {
								Bot.log(err);
							}
						}
						fs.unlink(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, () => {});
						clearGameTimer($);
						delete Bot.rooms[room].scrabble[$.id];
						return;
					}
					gameTimer($, $.players[$.order[$.turn]].name);
					$.spectators.forEach(u => Bot.say(room, $.HTML(u)));
					Object.keys($.players).forEach(u => Bot.say(room, $.HTML(u)));
					Bot.say(room, $.highlight());
					fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
						if (e) console.log(e);
					});
				}).catch(e => {
					Bot.say(room, $.HTML(by));
					Bot.roomReply(room, by, e);
				});
				break;
			}
			case 'select': case 'choose': case 'c': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame(by, args[1], Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, "Game not found");
				if (!$.isTurn(by)) return Bot.roomReply(room, by, 'Not your turn!');
				const player = $.getPlayer($.turn);
				args.shift();
				if (parseInt(args[0]) > 30) args.shift();
				const cargs = args.join(' ').match(/\b\d+\b/g).map(n => ~~n);
				if (cargs.length !== 2) return Bot.roomReply(room, by, 'Selections must have exactly two numbers');
				player.selected = cargs.join(',');
				Bot.say(room, $.HTML(by));
				break;
			}
			case 'openexchange': case 'oe': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame(by, args[1], Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, "Game not found");
				if (!$.isTurn(by)) return Bot.roomReply(room, by, 'Not your turn!');
				const player = $.getPlayer($.turn);
				player.exchange = true;
				Bot.say(room, $.HTML(by));
				break;
			}
			case 'closeexchange': case 'ce': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame(by, args[1], Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, "Game not found");
				if (!$.isTurn(by)) return Bot.roomReply(room, by, 'Not your turn!');
				const player = $.getPlayer($.turn);
				player.exchange = false;
				Bot.say(room, $.HTML(by));
				break;
			}
			case 'exchange': case 'x': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame(by, args[1], Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, "Game not found");
				if (!$.isTurn(by)) return Bot.roomReply(room, by, 'Not your turn!');
				const player = $.getPlayer($.turn);
				args.shift();
				if (parseInt(args[0]) > 30) args.shift();
				$.exchange(args.join('')).then(res => {
					const newLetters = res[1];
					if (newLetters.includes(' ')) {
						// eslint-disable-next-line max-len
						Bot.roomReply(room, by, `If you want to use one of your blank tiles, then enter the letter you want the blank to be used as followed by a '. For example, if you’re trying to play the word trace and want to use your blank as a C, then you would type TRAC'E into the ‘Type your word here’ box.`);
					}
					// eslint-disable-next-line max-len
					Bot.say(room, `/adduhtml scrabbleplay${$.id},<hr/>${tools.colourize(by.substr(1))} exchanged ${res[0].length} tile(s)<span style="float:right"><button name="send" value="/msg ${Bot.status.nickName},${prefix}scrabble ${room} watch ${$.id}">Watch</button></span><hr/>`);
					$.nextTurn();
					$.spectators.forEach(u => Bot.say(room, $.HTML(u)));
					Bot.say(room, $.highlight());
					Object.keys($.players).forEach(u => Bot.say(room, $.HTML(u)));
					clearGameTimer($);
					fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
						if (e) console.log(e);
					});
				}).catch(e => {
					return Bot.roomReply(room, by, e);
				});
				break;
			}
			case 'pass': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame(by, args[1], Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, "Game not found");
				if (!$.isTurn(by)) return Bot.roomReply(room, by, 'Not your turn!');
				if ($.nextTurn(true)) /* Game ends */ {
					$.ended = true;
					Bot.say(room, `The match has ended due to passing.`);
					$.deduct();
					$.spectators.forEach(u => Bot.say(room, $.HTML(u)));
					Object.keys($.players).forEach(u => Bot.say(room, $.HTML(u)));
					Bot.say(room, `/adduhtml SCRABBLEBOARD${$.id},${$.boardHTML()}`);
					Bot.say(room, `/adduhtml SCRABBLEPOINTS${$.id},${$.pointsHTML()}`);
					if (config.extConfig.aegii) {
						try {
							const logStr = `${new Date().toISOString()} | ${$.id} | ${pName.name.padStart(25, ' ')} >>> WON\n`;
							fs.appendFileSync(config.extConfig.aegii, logStr);
						} catch (err) {
							Bot.log(err);
						}
					}
					fs.unlink(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, () => {});
					clearGameTimer($);
					delete Bot.rooms[room].scrabble[$.id];
					return;
				}
				Bot.say(room, `/adduhtml scrabbleplay${$.id},<hr/>${tools.colourize(by.substr(1))} passed <span style="color:rgba(0,0,0,0)">gas</span><span style="float:right"><button name="send" value="/msg ${Bot.status.nickName},${prefix}scrabble ${room} watch ${$.id}">Watch</button></span><hr/>`);
				gameTimer($, $.players[$.order[$.turn]].name);
				$.spectators.forEach(u => Bot.say(room, $.HTML(u)));
				Object.keys($.players).forEach(u => Bot.say(room, $.HTML(u)));
				Bot.say(room, $.highlight());
				fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
					if (e) console.log(e);
				});
				break;
			}
			case 'end': case 'e': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame('', args.slice(1).join(' '), Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, 'No game specified/found');
				Bot.say(room, `/adduhtml SCRABBLE-${$.id},<hr>Ended game #${$.id}<hr>`);
				if ($.started) {
					$.deduct();
					Bot.say(room, `/adduhtml SCRABBLEBOARD${$.id},${$.boardHTML()}`);
					Bot.say(room, `/adduhtml SCRABBLEPOINTS${$.id},${$.pointsHTML()}`);
				}
				// UGOCODE
				/*
				if (UGOR(room)) {
					const users = Object.keys($.players).filter(t => t);
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
				fs.unlink(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, () => {});
				delete Bot.rooms[room].scrabble[$.id];
				break;
			}
			case 'endsilent': case 'es': case 'endquiet': case 'eq': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame('', args.slice(1).join(' '), Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, 'No game specified/found');
				Bot.say(room, `/adduhtml SCRABBLE-${$.id},<hr>Ended game #${$.id}<hr>`);
				fs.unlink(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, () => {});
				delete Bot.rooms[room].scrabble[$.id];
				break;
			}
			case 'stash': case 'store': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame('', args.slice(1).join(' '), Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, 'No game specified/found');
				Bot.say(room, `/adduhtml SCRABBLE-${$.id},<hr>Stashed game #${$.id}<hr>`);
				delete Bot.rooms[room].scrabble[$.id];
				break;
			}
			case 'rejoin': case 'rj': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const games = Object.values(Bot.rooms[room].scrabble)
					.filter($ => $.players[toID(by)] || $.spectators.includes(toID(by)))
					.filter($ => $.started);
				if (!games.length) return Bot.roomReply(room, by, 'No game(s) found');
				games.forEach($ => Bot.say(room, $.HTML(by)));
				break;
			}
			case 'spectate': case 's': case 'watch': case 'w': case 'see': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				args.shift();
				const $ = this.findGame(by, args.join(' '), Bot.rooms[room].scrabble, 'watch');
				if (!$) return Bot.roomReply(room, by, 'No game specified/found');
				const ID = toID(by);
				if ($.getPlayer(ID)) return Bot.roomReply(room, by, "You're a player!");
				if ($.spectators.includes(ID)) return Bot.roomReply(room, by, 'You are already spectating this game!');
				$.spectators.push(ID);
				Bot.say(room, $.HTML(ID));
				Bot.roomReply(room, by, `You are now spectating the match of Scrabble!`);
				break;
			}
			case 'unspectate': case 'us': case 'unwatch': case 'uw': case 'unsee': case 'u': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				args.shift();
				const $ = this.findGame(by, args.join(' '), Bot.rooms[room].scrabble, 'unwatch');
				if (!$) return Bot.roomReply(room, by, 'No game specified/found');
				const ID = toID(by);
				if ($.getPlayer(ID)) return Bot.roomReply(room, by, "You're a player!");
				if (!$.spectators.includes(ID)) return Bot.roomReply(room, by, 'You aren\'t spectating this game!');
				$.spectators.remove(ID);
				Bot.roomReply(room, by, `You are no longer spectating the match of Scrabble.`);
				break;
			}
			case 'forfeit': case 'leave': case 'f': case 'ff': case 'ihavebeenpwned': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame(by, args[1], Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, "Game not found");
				if (!$.getPlayer(by)) return Bot.roomReply(room, by, "You're not a player!");
				const isTurn = $.isTurn(by);
				$.removePlayer(by).then(res => {
					if (res) {
						$.ended = true;
						Bot.say(room, `The match has ended due to a forfeit.`);
						$.deduct();
						// UGOCODE
						// if (UGOR(room)) endUGOgame($);
						// ENDUGOCODE
						$.spectators.forEach(u => Bot.say(room, $.HTML(u)));
						Object.keys($.players).forEach(u => Bot.say(room, $.HTML(u)));
						Bot.say(room, `/adduhtml SCRABBLEBOARD${$.id},${$.boardHTML()}`);
						Bot.say(room, `/adduhtml SCRABBLEPOINTS${$.id},${$.pointsHTML()}`);
						fs.unlink(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, () => {});
						clearGameTimer($);
						delete Bot.rooms[room].scrabble[$.id];
						return;
					}
					Bot.say(room, `/adduhtml scrabbleplay${$.id},<hr/>${tools.colourize(by.substr(1))} forfeited<hr/>`);
					gameTimer($, $.players[$.order[$.turn]].name);
					$.spectators.forEach(u => Bot.say(room, $.HTML(u)));
					Object.keys($.players).forEach(u => Bot.say(room, $.HTML(u)));
					fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
						if (e) console.log(e);
					});
				}).catch(e => {
					Bot.roomReply(room, by, e);
				});
				break;
			}
			case 'backups': case 'bu': case 'stashed': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, "Access denied.");
				fs.readdir('./data/BACKUPS', (err, files) => {
					if (err) {
						Bot.say(room, err);
						return Bot.log(err);
					}
					const games = files
						.filter(file => file.startsWith(`scrabble-${room}-`))
						.map(file => file.slice(0, -5))
						.map(file => file.split('-').pop());
					if (games.length) {
						Bot.say(room, `/adduhtml SCRABBLEBACKUPS, <details><summary>Game Backups</summary><hr>${games.map(game => {
							try {
								const $ = require(`../../data/BACKUPS/scrabble-${room}-${game}.json`);
								// eslint-disable-next-line max-len
								return `<button name="send" value="/msg ${Bot.status.nickName},${prefix}scrabble ${room} restore ${game}">${tools.escapeHTML(tools.listify($.order.map(p => $.players[p].name))) || '(no one)'}</button>`;
							} catch {
								return null;
							}
						}).filter(Boolean).join('<br>')}</details>`);
					} else Bot.say(room, "No backups found.");
				});
				break;
			}
			case 'restore': case 'resume': case 'r': {
				args.shift();
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, "Access denied.");
				const id = parseInt(args.join(''));
				if (!id) return Bot.roomReply(room, by, "Invalid ID.");
				if (Bot.rooms[room].scrabble?.[id]) return Bot.roomReply(room, by, "Sorry, that game is already in progress!");
				fs.readFile(`./data/BACKUPS/scrabble-${room}-${id}.json`, 'utf8', (err, file) => {
					if (err) return Bot.roomReply(room, by, "Sorry, couldn't find that game!");
					if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
					Bot.rooms[room].scrabble[id] = GAMES.create('scrabble', id, room, JSON.parse(file));
					const $ = Bot.rooms[room].scrabble[id];
					Bot.say(room, `The game between ${tools.listify($.order.map(p => $.players[p].name))} has been restored!`);
					$.spectators.forEach(u => Bot.say(room, $.HTML(u)));
					Object.keys($.players).forEach(u => Bot.say(room, $.HTML(u)));
				});
				break;
			}
			case 'menu': case 'm': case 'list': case 'l': case 'players': {
				const scrabble = Bot.rooms[room].scrabble;
				if (!scrabble || !Object.keys(scrabble).length) {
					if (tools.hasPermission(by, 'gamma', room) && !isPM) return Bot.say(room, "Sorry, no games found.");
					return Bot.roomReply(room, by, "Sorry, no games found.");
				}
				const html = `<hr>${Object.keys(scrabble).map(id => {
					const $ = scrabble[id];
					// eslint-disable-next-line max-len
					return `${$.started ? `${tools.listify($.order.map(u => tools.colourize($.players[u].name)))} <button name="send" value="/msg ${Bot.status.nickName},${prefix}scrabble ${room} spectate ${$.id}">Watch!</button>` : `<button name="send" value="/msg ${Bot.status.nickName},${prefix}scrabble ${room} join ${$.id}">Join</button>`}(#${id})`;
				}).join('<br>')}<hr>`;
				const staffHTML = `<hr>${Object.keys(scrabble).map(id => {
					const $ = scrabble[id];
					// eslint-disable-next-line max-len
					return `${$.started ? `${tools.listify($.order.map(u => tools.colourize($.players[u].name)))} <button name="send" value="/msg ${Bot.status.nickName},${prefix}scrabble ${room} spectate ${$.id}">Watch!</button>` : `<button name="send" value="/msg ${Bot.status.nickName},${prefix}scrabble ${room} join ${$.id}">Join</button>`}<button name="send" value="/msg ${Bot.status.nickName},${prefix}scrabble ${room} end ${$.id}">End</button><button name="send" value="/msg ${Bot.status.nickName},${prefix}scrabble ${room} stash ${$.id}">Stash</button>(#${id})`;
				}).join('<br>')}<hr>`;
				if (isPM === 'export') return [html, staffHTML];
				if (tools.hasPermission(by, 'gamma', room) && !isPM) {
					Bot.say(room, `/adduhtml SCRABBLEMENU,${html}`);
					Bot.say(room, `/changerankuhtml +, SCRABBLEMENU, ${staffHTML}`);
				} else Bot.say(room, `/sendprivatehtmlbox ${by}, ${html}`);
				break;
			}
			case 'disqualify': case 'dq': {
				if (!tools.hasPermission(by, 'beta', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (isPM) return Bot.roomReply(room, by, 'Scum do it in chat');
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				args.shift();
				let context = '';
				if (~~args[0]) context = args.shift();
				const $ = this.findGame(args.join(' '), context, Bot.rooms[room].scrabble, 'action');
				if (!$) return Bot.roomReply(room, by, 'No game specified/found');
				const user = toID(args.join(''));
				const isTurn = $.isTurn(user);
				$.removePlayer(user).then(res => {
					if (res) {
						$.ended = true;
						Bot.say(room, `The match has ended due to a disqualification.`);
						$.deduct();
						// UGOCODE
						// if (UGOR(room)) endUGOgame($);
						// ENDUGOCODE
						$.spectators.forEach(u => Bot.say(room, $.HTML(u)));
						Object.keys($.players).forEach(u => Bot.say(room, $.HTML(u)));
						Bot.say(room, `/adduhtml SCRABBLEBOARD${$.id},${$.boardHTML()}`);
						Bot.say(room, `/adduhtml SCRABBLEPOINTS${$.id},${$.pointsHTML()}`);
						fs.unlink(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, () => {});
						delete Bot.rooms[room].scrabble[$.id];
						return;
					}
					if (isTurn) $.nextTurn();
					Bot.say(room, `/adduhtml scrabbleplay${$.id},<hr/>${tools.colourize(user)} was DQed<hr/>`);
					$.spectators.forEach(u => Bot.say(room, $.HTML(u)));
					Object.keys($.players).forEach(u => Bot.say(room, $.HTML(u)));
					fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
						if (e) console.log(e);
					});
				}).catch(e => {
					Bot.roomReply(room, by, e);
				});
				break;
			}
			case 'bag': case 'left': case 'b': {
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const $ = this.findGame(by, args[1], Bot.rooms[room].scrabble, 'unwatch');
				if (!$) return Bot.roomReply(room, by, "Game not found");
				const tiles = $.bag.length;
				if (isPM) return Bot.pm(by, `The bag has ${tiles} tile(s) left.`);
				if (tools.hasPermission(by, 'gamma', room)) Bot.say(room, `The bag has ${tiles} tile(s) left.`);
				else Bot.roomReply(room, by, `The bag has ${tiles} tile(s) left.`);
				break;
			}
			case 'sub': case 'substitute': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (isPM) return Bot.roomReply(room, by, 'Scum do it in chat');
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				args.shift();
				let context = '';
				if (~~args[0]) context = args.shift();
				else context = args.join(' ');
				const $ = this.findGame('', context, Bot.rooms[room].scrabble, 'sub');
				if (!$) return Bot.roomReply(room, by, `Unable to find the game you meant to sub people in!`);
				let first;
				const ctx = args.join(' ').split(/(?:,|\s+v(?:er)?s(?:us)?\.?\s+)/);
				if (ctx.length !== 2) return Bot.roomReply(room, by, `Err, I sub one in and one out; that's how this works`);
				if ($.players[toID(ctx[0])] && !$.players[toID(ctx[1])]) first = true;
				else if (!$.players[toID(ctx[0])] && $.players[toID(ctx[1])]) first = false;
				else {
					Bot.log($);
					return Bot.roomReply(room, by, 'Something went wrong! (PartMan is investigating)');
				}
				const going = first ? ctx[0] : ctx[1];
				const coming = first ? ctx[1] : ctx[0];
				// UGOCODE
				/*
				if (UGOR(room)) {
					const user = toID(coming);
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
					const users = [toID(going)];
					const UGODB = Bot.UGO.object();
					users.forEach(u => {
						u = toID(u);
						const userGames = (UGODB[u] || {});
						userGames[gameName]--;
					});
					Bot.UGO.save();
				}
				*/
				// ENDUGOCODE
				$.players[toID(coming)] = $.players[toID(going)];
				delete $.players[toID(going)];
				$.players[toID(coming)].name = coming;
				$.players[toID(coming)].id = toID(coming);
				$.order.splice($.order.indexOf(toID(going)), 1, toID(coming));
				$.spectators.remove(toID(coming));
				$.spectators.push(toID(going));
				Bot.say(room, $.HTML(coming));
				Bot.say(room, $.HTML(going));
				fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
					if (e) console.log(e);
				});
				return Bot.say(room, `[[ ]]${going} has been subbed with ${coming}!`);
			}
			case 'dict': case 'd': case 'dictionary': case 'usedict': case 'ud': case 'usedictionary': case 'use': {
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const cargs = args.slice(1).join(' ').split(',');
				const $ = this.findGame('', cargs[0], Bot.rooms[room].scrabble, 'gamerule');
				if (!$) return Bot.roomReply(room, by, 'No game specified/found');
				if (!toID(cargs.join(''))) return Bot.say(room, `The current dictionary is ${$.dict?.toUpperCase() || 'CSW21'}.`);
				if ($.started && $.placed.flat().find(tile => tile)) {
					return Bot.say(room, `You may not change the dictionary after a word has been played.`);
				}
				if (~~cargs[0]) cargs.shift();
				const dict = toID(cargs.join(''));
				if (!require('../../data/WORDS/index.js').isDict(dict)) return Bot.say(room, 'Invalid dictionary!');
				$.dict = dict;
				fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
					if (e) console.log(e);
				});
				Bot.say(room, `Scrabble #${$.id} is now using ${dict.toUpperCase()}.`);
				break;
			}
			case 'mod': case 'mode': case 'om': case 'gamemode': case 'modify': case 'gamemod': case 'fm': case 'forcemod': {
				// UGOCODE
				// return Bot.roomReply(room, by, `PokéMod is the only mod playable during UGO. POKÉMOD SUPREMACY!`);
				// ENDUGOCODE
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (!Bot.rooms[room].scrabble) Bot.rooms[room].scrabble = {};
				const cargs = args.slice(1).join(' ').split(',');
				const $ = this.findGame('', cargs[0], Bot.rooms[room].scrabble, 'gamerule');
				if (!$) return Bot.roomReply(room, by, 'No game specified/found');
				if ($.started && $.placed.flat().find(tile => tile)) {
					return Bot.say(room, `You may not apply a mod after a word has been played.`);
				}
				if (~~cargs[0]) cargs.shift();
				const mod = toID(cargs.join(''));
				const modded = $.mod(mod);
				if (!modded) return Bot.say(room, `Unable to find that mod!`);
				if (modded === 'pokemon' && !['forcemod', 'fm'].includes(toID(args[0]))) {
					if (Math.random() < 0.2) {
						Bot.say(room, `Uh-oh it looks like I dropped a CRAZY bomb!`);
						Bot.say(room, `Scrabble #${$.id} has accidentally enabled the mod CRAZYMONS!`);
						$.mod('crazymons');
					} else Bot.say(room, `Scrabble #${$.id} has enabled the mod ${mod}.`);
				} else Bot.say(room, `Scrabble #${$.id} has enabled the mod ${mod}.`);
				fs.writeFile(`./data/BACKUPS/scrabble-${$.room}-${$.id}.json`, JSON.stringify($), e => {
					if (e) console.log(e);
				});
				break;
			}
			default: Bot.roomReply(room, by, 'No idea what that option was supposed to do');
		}
	}
};
