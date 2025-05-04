// UGOCODE
/*
const gameLimit = 1000;
const pointsLimit = 10;
const gameName = 'mastermind';
const gameTitle = 'Mastermind';
const pointsWin = 2;
const pointsLose = 0;
*/

module.exports = {
	help: `Mastermind, the code-breaking game! Type \`\`${prefix}mastermind new (guess limit, optional)\`\` to make a game. Rules: https://docs.google.com/document/u/1/d/e/2PACX-1vRiZyg6D3sg-TS5ya-MOBBvbnM-NuQm_jrkV3hXtzFYnXSV-FnATcLs8LftjKUr4i_yCbIW-eZJppdj/pub`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client, pm) {
		if (!tools.canHTML(room) && !room.startsWith('groupchat-')) {
			return Bot.say(room, "Sorry, can't do that here - I need to be a room Bot.");
		}
		let user;
		if (!args.length) args.push('help');
		switch (toID(args.shift())) {
			case 'help': case 'h': {
				if (tools.hasPermission(by, 'gamma', room) && !pm) return Bot.say(room, this.help);
				else return Bot.roomReply(room, by, this.help);
				break;
			}
			case 'new': case 'n': {
				if (!Bot.rooms[room].mastermind) Bot.rooms[room].mastermind = {};
				const mm = Bot.rooms[room].mastermind;
				user = toID(by);
				if (mm[user]) return Bot.roomReply(room, by, `You're already playing one! If you want to end the current one, do \`\`${prefix}mastermind end\`\`.`);
				// if (pm) return Bot.roomReply(room, by, "Can't start one from PMs. o.o");
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
				Bot.say(room, `/sendprivatehtmlbox ${by}, <h2>Psst; in the future use ]mastermind instead! This version is being phased out.</h2>`);
				let limit;
				if (args.length) limit = parseInt(args);
				if (limit && !(limit < 13 && limit > 3)) {
					Bot.roomReply(room, by, "Invalid limit; limit has been set to 10.");
					limit = 10;
				}
				if (!limit) limit = 10;
				mm[user] = GAMES.create('mastermind', room, by, limit);
				Bot.say(room, `/adduhtml MM${user},<hr/>${by.substr(1)} is playing a round of Mastermind!&nbsp;&nbsp;&nbsp;<button name="send" value="/botmsg ${Bot.status.nickName}, ${prefix}mastermind ${room} watch ${user}">Watch</button><br/><br/><form data-submitsend="/msgroom ${room}, /botmsg ${Bot.status.nickName},${prefix}mastermind ${room} setcode ${user}, {code}"><label for="choosecode">Set Code: </label><input type="text" id="choosecode" name="code" style="width: 30px;"> &nbsp;&nbsp;<input type="submit" value="Set"/></form><hr/>`);
				mm[user].sendPages();
				return;
				break;
			}
			case 'guess': case 'g': case 'play': case 'p': {
				if (!Bot.rooms[room].mastermind) return Bot.roomReply(room, by, "No games are active.");
				const mm = Bot.rooms[room].mastermind;
				user = toID(by);
				if (!mm[user]) return Bot.roomReply(room, by, "You're not playing...");
				if (!args.length) return Bot.roomReply(room, by, unxa);
				const guess = args.join('').replace(/[^0-7]/g, '');
				if (guess.length !== 4) {
					mm[user].sendPages(true);
					return Bot.roomReply(room, by, "Invalid guess - your guess must contain four valid numbers from 0-7.");
				}
				return mm[user].guess(guess).then(end => {
					switch (end) {
						case 0: {
							if (mm[user].guesses.length === 1) Bot.say(room, `/changeuhtml MM${user}, <hr/>${tools.escapeHTML(by.substr(1))} is playing a round of Mastermind!&nbsp;&nbsp;&nbsp;<button name="send" value="/botmsg ${Bot.status.nickName},${prefix}mastermind ${room} watch ${user}">Watch</button><hr/>`);
							return mm[user].sendPages();
							break;
						}
						case 1: {
							Bot.say(room, `/changeuhtml MM${user}, <hr/>${tools.escapeHTML(by.substr(1))} is playing a round of Mastermind!<hr/>`);
							Bot.say(room, `${by.substr(1)} successfully cracked ${mm[user].sol.join('')} in ${mm[user].guesses.length} tr${mm[user].guesses.length === 1 ? 'y' : 'ies'}!`);
							mm[user].sendPages();
							// UGOCODE
							/*
							if (UGOR(room)) {
								const played = Number(Bot.UGO.get(user)?.[gameName]);
								if (played <= pointsLimit) awardUGOPoints(pointsWin, [toID(by.substr(1))]);
							}
							*/
							// ENDUGOCODE
							return delete mm[user];
							break;
						}
						case 2: {
							Bot.say(room, `/changeuhtml MM${user}, <hr/>${tools.escapeHTML(by.substr(1))} is playing a round of Mastermind!<hr/>`);
							Bot.say(room, `${by.substr(1)} was unable to crack ${mm[user].sol.join('')} in ${mm[user].guesses.length} tries. ;-;`);
							mm[user].sendPages();
							// UGOCODE
							/*
							if (UGOR(room)) {
								const played = Number(Bot.UGO.get(user)?.[gameName]);
								if (played <= pointsLimit) awardUGOPoints(pointsLose, [by.substr(1)]);
							}
							*/
							// ENDUGOCODE
							return delete mm[user];
							break;
						}
					}
				}).catch(err => {
					Bot.roomReply(room, by, err);
					mm[user].sendPages();
				});
				break;
			}
			case 'setcode': {
				if (!Bot.rooms[room].mastermind) return Bot.roomReply(room, by, "No games are active.");
				// UGOCODE
				// if (room === 'boardgames') return Bot.roomReply(room, by, 'Code setting is disabled during UGO.');
				const mm = Bot.rooms[room].mastermind;
				const [target, code] = args.join(' ').split(',').map(toID);
				if (!target || !/^[0-7]{4}$/.test(code)) return Bot.roomReply(room, by, 'Welp, that wasn\'t a valid code - try again in another match!');
				if (!mm.hasOwnProperty(target)) return Bot.roomReply(room, by, "Don't have anyone by that name playing");
				const game = mm[target];
				if (game.forced) return Bot.roomReply(room, by, `This game's code has already been set.`);
				if (game.guesses.length) return Bot.roomReply(room, by, `They've already started answering - try a bit faster next time!`);
				if (target === toID(by)) return Bot.roomReply(room, by, `You have set the code to ${code[0]}- WAIT A MINUTE THIS IS YOU`);
				const old = game.sol.join('');
				game.sol = code.split('').map(num => ~~num);
				game.forced = toID(by);
				Bot.roomReply(room, by, `You have set the code to ${code}`);
				Bot.say(room, `${by.substr(1)} has chosen a code for ${target}!`);
				Bot.say(room, `/changeuhtml MM${target}, <hr/>${tools.escapeHTML(game.name)} is playing a round of Mastermind!&nbsp;&nbsp;&nbsp;<button name="send" value="/botmsg ${Bot.status.nickName},${prefix}mastermind ${room} watch ${target}">Watch</button><hr/>`);
				break;
			}
			case 'spectate': case 's': case 'watch': case 'w': {
				if (!Bot.rooms[room].mastermind) return Bot.roomReply(room, by, "No games are active.");
				const mm = Bot.rooms[room].mastermind;
				user = toID(by);
				let input;
				if (!Object.keys(mm).length) return Bot.roomReply(room, by, "NOBODY. NOBODY AT ALL.");
				if (Object.keys(mm).length === 1) input = Object.keys(mm)[0];
				if (args.length) input = toID(args.join(''));
				if (!mm[input]) return Bot.roomReply(room, by, `Sorry, didn't find ${input ? `${input}'s` : 'a'} game.`);
				if (mm[input].spectators.includes(user)) return Bot.roomReply(room, by, "You're already spectating them - use rejoin to rejoin if you accidentally closed it, or unspectate to stop spectating.");
				if (mm[input].player === user) return Bot.roomReply(room, by, "Mirror, mirror, on the wall - who's the nerdiest of 'em all?");
				mm[input].spectators.push(user);
				Bot.roomReply(room, by, `You're now spectating ${mm[input].name}'s game of Mastermind!`);
				Bot.say(room, `/sendhtmlpage ${user}, Mastermind + ${room} + ${input},${mm[input].boardHTML()}`);
				break;
			}
			case 'unspectate': case 'us': case 'unwatch': case 'uw': case 'u': {
				if (!Bot.rooms[room].mastermind) return Bot.roomReply(room, by, "No games are active.");
				const mm = Bot.rooms[room].mastermind;
				user = toID(by);
				let input;
				if (!Object.keys(mm).length) return Bot.roomReply(room, by, "NOBODY. NOBODY AT ALL.");
				const games = Object.values(mm).filter(game => game.spectators.includes(user));
				if (games.length === 1) input = games[0].player;
				if (args.length) input = toID(args.join(''));
				if (!mm[input]) return Bot.roomReply(room, by, `Sorry, didn't find ${input}'s game.`);
				if (!mm[input].spectators.includes(user)) return Bot.roomReply(room, by, "You arne't spectating them - use the spectate option to spectate.");
				if (mm[input].player === user) return Bot.roomReply(room, by, "Mirror, mirror, on the wall - who's the nerdiest of 'em all?");
				mm[input].spectators.remove(user);
				Bot.roomReply(room, by, `You are no longer spectating ${mm[input].name}'s game of Mastermind. ;-;`);
				break;
			}
			case 'rejoin': case 'rj': {
				if (!Bot.rooms[room].mastermind) return Bot.roomReply(room, by, "No games are active.");
				const mm = Bot.rooms[room].mastermind;
				user = toID(by);
				if (!mm[user]) return Bot.roomReply(room, by, "You're not playing...");
				const users = [];
				Object.values(mm).forEach(game => {
					if (game.spectators.includes(user) || game.player === user) users.push(game.player);
				});
				users.forEach(game => Bot.say(room, `/sendhtmlpage ${user}, Mastermind + ${room} + ${game},${mm[game].boardHTML(mm[game].player === user)}`));
				break;
			}
			case 'forfeit': case 'ff': case 'f': case 'resign': case 'r': case 'end': case 'e': {
				if (!Bot.rooms[room].mastermind) return Bot.roomReply(room, by, "No games are active.");
				const mm = Bot.rooms[room].mastermind; user = toID(by);
				if (!mm[user]) return Bot.roomReply(room, by, "You're not playing...");
				Bot.say(room, `${by.substr(1)} was unable to crack ${mm[user].sol.join('')} in ${mm[user].guesses.length} tries. ;-;`);
				return delete mm[user];
				break;
			}
			case 'type': case 't': {
				if (!Bot.rooms[room].mastermind) return Bot.roomReply(room, by, "No games are active.");
				const mm = Bot.rooms[room].mastermind;
				user = toID(by);
				if (!mm[user]) return Bot.roomReply(room, by, "You're not playing...");
				if (!args.length) return Bot.roomReply(room, by, unxa);
				const guess = args.join('').replace(/[^0-7]/g, '');
				if (guess.length !== 1) return Bot.roomReply(room, by, "Invalid - your message must contain exactly one valid number from 0-7.");
				if (!mm[user].type(...guess)) {
					Bot.log(mm[user]);
					return Bot.roomReply(room, by, "Something went wrong!");
				}
				return mm[user].sendPages();
				break;
			}
			case 'backspace': case 'b': {
				if (!Bot.rooms[room].mastermind) return Bot.roomReply(room, by, "No games are active.");
				const mm = Bot.rooms[room].mastermind;
				user = toID(by);
				if (!mm[user]) return Bot.roomReply(room, by, "You're not playing...");
				if (mm[user].backspace()) mm[user].sendPages();
				return;
				break;
			}
			default: {
				Bot.roomReply(room, by, "Sorry, I don't get what you want me to do. Take a hug instead.");
			}
		}
	}
};
