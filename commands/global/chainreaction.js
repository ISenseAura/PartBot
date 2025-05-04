// UGOCODE
/*
const gameLimit = 1000;
const pointsLimit = 20;
const gameName = 'chainreaction';
const gameTitle = 'Chain Reaction';
const pointsWin = game => 12 + Math.floor(Object.keys(game.players).length * 1.5);
const pointsLose = 9;
*/

function gameTimer (game, turn) {
	const time = 45;
	if (!Bot.rooms[game.room]) return;
	if (!Bot.rooms[game.room].gameTimers) Bot.rooms[game.room].gameTimers = {};
	const gameTimers = Bot.rooms[game.room].gameTimers;
	clearTimeout(gameTimers['onlygame']);
	gameTimers['onlygame'] = setTimeout(() => Bot.say(game.room, `${turn} hasn't played for the past ${time} seconds...`), time * 1000);
}

function clearGameTimer (game) {
	clearTimeout(Bot.rooms[game.room]?.gameTimers?.['onlygame']);
}

module.exports = {
	help: `Guide (courtesy bro torterra, SaltiestCactus23, and Stan the Nova): https://docs.google.com/document/d/1Ft1M-h7TRDrkEz4LdWoSygmty8XDsRpd2S5HyF_9e1Y`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client, isPM) {
		if (!args.length) args.push('help');
		switch (toID(args.shift())) {
			case 'help': case 'h': {
				if (isPM) return Bot.roomReply(room, by, this.help);
				return Bot.say(room, this.help);
				break;
			}
			case 'join': case 'j': {
				const game = Bot.rooms[room].chainreaction;
				if (!game) return Bot.roomReply(room, by, 'Nope, no Chain Reaction here.');
				if (game.started) return Bot.roomReply(room, by, 'F in being too late.');
				const pls = Object.keys(game.players);
				if ((game.beeg ? pls >= 15 : pls >= 8) || pls >= game.height * game.width) return Bot.roomReply(room, by, "Sorry, hit the player cap. ;-;");
				if (!game.beeg) {
					// UGOCODE
					/*
					if (UGOR(room)) {
						const user = toID(by);
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
				}
				if (game.addPlayer(by.substr(1))) return Bot.say(room, `${by.substr(1)} joined the game!`);
				return Bot.roomReply(room, by, "You're already in it. o.o");
				break;
			}
			case 'leave': case 'l': {
				if (!Bot.rooms[room].chainreaction) return Bot.roomReply(room, by, 'Nope, no Chain Reaction here.');
				if (Bot.rooms[room].chainreaction.started) return Bot.roomReply(room, by, 'F in being too late.');
				if (Bot.rooms[room].chainreaction.removePlayer(by.substr(1))) {
					if (!Bot.rooms[room].chainreaction.beeg) {
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
					}
					return Bot.say(room, `${by.substr(1)} left the game!`);
				}
				return Bot.roomReply(room, by, "Join first, nerd.");
				break;
			}
			case 'new': case 'n': {
				if (isPM) return Bot.roomReply(room, by, "Games can only be created in chat.");
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.roomReply(room, by, "Access denied.");
				if (Bot.rooms[room].chainreaction) return Bot.roomReply(room, by, 'One\'s going on.');
				if (!(['boardgames'].includes(room) && tools.hasPermission(by, 'gamma', room)) && !tools.hasPermission(by, 'beta', room)) return Bot.roomReply(room, by, 'Access denied.');
				let dimensions = [9, 6];
				let beeg = false;
				if (args[0] === 'beeg' && tools.hasPermission(by, 'admin')) {
					dimensions = [15, 15];
					beeg = true;
					args = [];
				}
				args = args.join(' ').split(/[ ,x]/);
				if (args.length) {
					args = args.map(t => parseInt(t));
					if (args.length === 2 && !isNaN(args[0]) && !isNaN(args[1])) {
						if (args[0] > 15 || args[0] < 1 || args[1] > 15 || args[1] < 1) return Bot.say(room, "Not a good board size.");
						else if (args[0] * args[1] < 5) return Bot.say(room, "Board too smol.");
						else dimensions = args;
					}
				}
				Bot.rooms[room].chainreaction = GAMES.create('chainreaction', ...dimensions, room, beeg);
				Bot.say(room, `A ${beeg ? 'BEEG ' : ''}game of Chain Reaction has been created! Use \`\`${prefix}chainreaction join\`\` to join!`);
				Bot.say(room, `/notifyrank all, Chain Reaction, A new game of ${beeg ? 'BEEG ' : ''}Chain Reaction has been created!,chainreactionsignup`);
				break;
			}
			case 'start': case 's': {
				if (!Bot.rooms[room].chainreaction) return Bot.roomReply(room, by, 'Nope, no Chain Reaction here.');
				if (!(['boardgames'].includes(room) && tools.hasPermission(by, 'gamma', room)) && !tools.hasPermission(by, 'beta', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (Bot.rooms[room].chainreaction.started) return Bot.roomReply(room, by, 'F in being too late.');
				if (Object.keys(Bot.rooms[room].chainreaction.players).length < 2) return Bot.say(room, "Not enough players. ;-;");
				Bot.rooms[room].chainreaction.start();
				break;
			}
			case 'click': {
				const CR = Bot.rooms[room].chainreaction;
				if (!CR) return Bot.roomReply(room, by, 'Nope, no Chain Reaction here.');
				if (!CR.started) return Bot.roomReply(room, by, 'Not started. -_-');
				if (!args.length == 2) return Bot.roomReply(room, by, unxa);
				if (CR.turn !== toID(by) || CR.displaying) return;
				const boards = CR.tap(parseInt(args.shift()), parseInt(args.shift()), CR.players[toID(by)].col);
				if (!boards || !boards.length) return Bot.roomReply(room, by, 'Just click an empty spot or your own colour, nerd.');
				new Promise((resolve, reject) => {
					if (CR.timer) clearGameTimer(CR);
					function displayQueue () {
						if (!boards.length) return resolve();
						Bot.say(room, `/adduhtml CR, ${boards.shift()}`);
						setTimeout(displayQueue, 1000);
					}
					CR.displaying = true;
					displayQueue();
				}).then(() => {
					CR.displaying = false;
					const winner = CR.nextTurn();
					const turn = CR.turn;
					if (winner) {
						Bot.say(room, `/adduhtml CRGRATZ, Game ended! GG! Congratulations to <font color="${CR.players[winner].col}">@</font>${tools.escapeHTML(CR.players[winner].name)}!`);
						// UGOCODE
						/*
						if (UGOR(room) && !CR.beeg) {
							const played = Number(Bot.UGO.get(toID(winner))?.[gameName]);
							if (played <= pointsLimit) awardUGOPoints(pointsWin(CR), [winner]);
							awardUGOPoints(pointsLose, Object.keys(CR.players).filter(p => winner !== p && !CR.DQs?.includes(p)).filter(p => Number(Bot.UGO.get(p)?.[gameName]) <= pointsLimit));
						}
						*/
						// ENDUGOCODE
						clearGameTimer(CR);
						delete Bot.rooms[room].chainreaction;
					} else {
						const messages = [
							"{NAME} donut it's your turn go play",
							"{UNAME} AAAAAA GO PLAY",
							"Psst {NAME} play already",
							"{NAME} murder time Y/Y",
							"When click @{NAME}",
							"Yo {NAME} thoughts on boom?",
							"{UNAME} LET'S GO KABOOM",
							"WOOO EXPLOSIONS {UNAME} DON'T DISAPPOINT ME",
							"{NAME} eenie meenie miney BLOW!",
							"{NAME} I blame you for not playing fast enough",
							"WEE WOO WEE WOO {UNAME}",
							"<i>hugs {NAME}</i>",
							"<i>bullies {NAME}</i>",
							"{NAME} you're a nerd",
							"The mood for murder has struck, {NAME}",
							"{UNAME} CLICKCLICKCLICKCLICK",
							"{NAME} play or I SD14 you",
							"{UNAME} I SEEK THE BLOOD OF MY ENEMIES",
							"/ban {NAME}, Took too long",
							"{NAME}. You are the chosen one.",
							"{NAME}, harbinger of doom.",
							"{NAME} i-it's not like I want you to c-click quickly, b-baka! &gt;///&lt;",
							"{NAME} if you don't play you're going to bed without dinner tonight",
							",egg {NAME}"
						];
						Bot.say(room, `/sendprivatehtmlbox ${CR.players[turn].name}, <div class="chat chatmessage-partbot highlighted"><small>[PRIVATE] </small><strong style="color:#8b5ec9;"><small>*</small><span class="username" data-roomgroup="*" data-name="PartBot">PartBot</span>:</strong> <em>${messages.random().replace(/{NAME}/g, CR.players[turn].name).replace(/{UNAME}/g, CR.players[turn].name.toUpperCase())}</em></div>`);
						gameTimer(CR, CR.players[turn].name);
					}
				}).catch();
				break;
			}
			case 'end': case 'e': {
				if (!(['boardgames'].includes(room) && tools.hasPermission(by, 'gamma', room)) && !tools.hasPermission(by, 'beta', room)) return Bot.roomReply(room, by, 'Access denied.');
				const CR = Bot.rooms[room].chainreaction;
				if (!CR) return Bot.say(room, "Didn't have one active anyways.");
				// UGOCODE
				/*
				if (UGOR(room) && !CR.beeg) {
					const UGODB = Bot.UGO.object();
					Object.keys(CR.players).forEach(u => {
						u = toID(u);
						const userGames = (UGODB[u] || {});
						userGames[gameName] = userGames[gameName] ? userGames[gameName] - 1 : 0;
					});
					Bot.UGO.save();
				}
				*/
				// ENDUGOCODE
				clearGameTimer(CR);
				delete Bot.rooms[room].chainreaction;
				Bot.say(room, "Game ended!");
				break;
			}
			case 'disqualify': case 'dq': case 'modkill': case 'mk': {
				if (!(['boardgames'].includes(room) && tools.hasPermission(by, 'gamma', room)) && !tools.hasPermission(by, 'beta', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (isPM) return Bot.roomReply(room, by, "Do it in chat, onegai");
				const CR = Bot.rooms[room].chainreaction;
				if (!CR) return Bot.say(room, "Didn't have one active anyways.");
				const user = toID(args.join(''));
				if (!CR.PL.includes(user)) return Bot.say(room, "That user is not in the game.");
				if (!CR.order.includes(user)) return Bot.say(room, "That user is already eliminated. 'o.o");
				if (CR.turn === user) CR.nextTurn();
				CR.order.remove(user);
				Bot.say(room, `${CR.players[user].name} has been disqualified.`);
				if (!CR.DQs) CR.DQs = [];
				CR.DQs.push(user);
				if (CR.order.length < 2) {
					// UGOCODE
					/*
					if (UGOR(room) && !game.beeg) {
						const played = Number(Bot.UGO.get(toID(CR.order[0]))?.[gameName]);
						if (played <= pointsLimit) awardUGOPoints(pointsWin(CR), [toID(CR.order[0])]);
						awardUGOPoints(pointsLose, Object.keys(CR.players).filter(p => winner !== p && !CR.DQs?.includes(p)).filter(p => Number(Bot.UGO.get(toID(p))?.[gameName]) <= pointsLimit));
					}
					*/
					// ENDUGOCODE
					return CR.end();
				}
				return;
				break;
			}
			case 'board': case 'b': {
				if (!Bot.rooms[room].chainreaction) return Bot.roomReply(room, by, "C-can't find one. ;-;");
				if (!Bot.rooms[room].chainreaction.started) return Bot.roomReply(room, by, `Let is start onegai`);
				if (!tools.hasPermission(by, 'gamma', room)) return Bot.sendHTML(by, Bot.rooms[room].chainreaction.display());
				Bot.say(room, "/adduhtml CR, " + Bot.rooms[room].chainreaction.display());
				break;
			}
			case 'pl': case 'playerlist': case 'players': case 'order': case 'o': case 'turnorder': case 'to': {
				const CR = Bot.rooms[room].chainreaction;
				if (!CR) return Bot.roomReply(room, by, "Players of a non-existent game, surprisingly, do not exist.");
				const html = "<hr/>" + CR.order.map(u => CR.players[u]).map(u => `<b style="color:${u.col};">${u.name.replace(/</g, '&lt;')}</b>`).join(', ') + "<hr/>";
				if (tools.hasPermission(by, 'gamma', room)) Bot.say(room, `/adduhtml CRPLAYERS,${html}`);
				else Bot.sendHTML(by, html);
				break;
			}
			case 'sub': {
				if (!(['boardgames'].includes(room) && tools.hasPermission(by, 'gamma', room)) && !tools.hasPermission(by, 'beta', room)) return Bot.roomReply(room, by, 'Access denied.');
				if (isPM) return Bot.roomReply(room, by, "Say it in chat you coward");
				if (!Bot.rooms[room].chainreaction) return Bot.say(room, "Don't have a game active.");
				args = args.join(' ').split(/\s*,\s*/);
				if (args.length !== 2) return Bot.say(room, unxa);
				const CR = Bot.rooms[room].chainreaction;
				const ids = args.map(toID);
				if (Object.keys(CR.players).includes(ids[0]) && Object.keys(CR.players).includes(ids[1])) return Bot.say(room, 'The one you\'re subbing in is already a player!');
				if (!Object.keys(CR.players).includes(ids[0]) && !Object.keys(CR.players).includes(ids[1])) return Bot.say(room, "Neither of those are in the game.");
				const going = Object.keys(CR.players).includes(ids[1]) ? args[1] : args[0], coming = Object.keys(CR.players).includes(ids[1]) ? args[0] : args[1];
				if (coming === toID(Bot.status.nickName)) return Bot.say(room, 'NO U');
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
					const users = [going];
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
				CR.players[toID(coming)] = Object.assign({}, CR.players[toID(going)]);
				CR.players[toID(coming)].name = coming;
				delete CR.players[toID(going)];
				CR.order = CR.order.map(id => id === toID(going) ? toID(coming) : id);
				CR.PL = CR.PL.map(id => id === toID(going) ? toID(coming) : id);
				if (CR.turn === toID(going)) CR.turn = toID(coming);
				Object.keys(CR.colours).forEach(col => {
					if (CR.colours[col] === toID(going)) CR.colours[col] = toID(coming);
				});
				Bot.say(room, `/adduhtml CR, ${CR.display()}`);
				Bot.say(room, `[[ ]]${going} has been subbed with ${coming}!`);
				break;
			}
		}
	}
};
