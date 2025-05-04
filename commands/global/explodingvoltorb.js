module.exports = {
	cooldown: 1,
	help: `https://docs.google.com/document/d/1uSRf9zeXVuDtgHMeAVCRKM7Yta-ktUoq2YV8kK-iTL0/edit?usp=sharing`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client, cf) {
		if (!args.length) args.push('help');
		if (['skitty', 'meowth', 'lugia', 'espurr', 'liepard', '2xespeon', '3xespeon', '2xflareon', '3xflareon', '2xjolteon', '3xjolteon', '2xumbreon', '3xumbreon', '2xvaporeon', '3xvaporeon', 'eeveepower', 'eevee', 'deg'].includes(toID(args[0]))) args.unshift('action');
		switch (toID(args.shift())) {
			case 'help': case 'h': case 'rules': case 'r': {
				if (cf) return;
				let help = `<hr><details><summary><b>How To Play</b></summary><hr><details><summary>Cards</summary><img style="vertical-align: middle;" src="${tools.toShuffleImage('espeon')}" height="30" width="30"> Espeon - Standard card.<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('espurr')}" height="30" width="30"> Espurr - Peeks at the top 3 cards.<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('flareon')}" height="30" width="30"> Flareon - Standard card.<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('jolteon')}" height="30" width="30"> Jolteon - Standard card.<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('liepard')}" height="30" width="30"> Liepard - Steals a card from a target (the target chooses what card to give).<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('lugia')}" height="30" width="30"> Lugia - Shuffles the deck.<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('meowth')}" height="30" width="30"> Meowth - Ends your current turn without drawing and forces the next user to draw 2 extra cards during their turn. Can stack.<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('quagsire')}" height="30" width="30"> Quagsire - Lets you place a drawn Voltorb anywhere in the deck.<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('skitty')}" height="30" width="30"> Skitty - Ends your current turn without drawing.<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('snorlax')}" height="30" width="30"> Snorlax - Can be played even when not your turn. Negates a card (except Quagsire) if played within time.<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('umbreon')}" height="30" width="30"> Umbreon - Standard card.<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('vaporeon')}" height="30" width="30"> Vaporeon - Standard card.<br><img style="vertical-align: middle;" src="${tools.toShuffleImage('voltorb')}" height="30" width="30"> Voltorb - Makes you go kaboom! Cannot be negated, except by Quagsire.<br><br></details><details><summary>Playing</summary>Each turn has two parts:<br>a) Actions - You may play as many actions as you'd like during this part of your turn.<br>b) Drawing - You must draw a card to end your turn. The exceptions are Meowth and Skitty, which skip your turn. Also, Meowth forces the next player to take extra drawing actions.<br><br>Even when it's not your turn, you can still play Snorlax to counter other players.<br>The game ends when there's only one player left!</details></details><hr><details><summary><b>Combinations</b></summary><hr>2xEeveelution - Play two of the same Eeveelution and pick a target. One of their cards is randomly stolen and given to you.<br>3xEeveelution - Play three of the same Eeveelution, and pick a target, along with a desired card. If the target has that card, they have to give it to you. Otherwise, you get nothing.<br>Eevee Power - Play one of each of the five Eeveelutions and pick a card from the discard pile. You may add that card to your hand.<br></details><hr><details><summary><b>Commands</b></summary><hr>${prefix}explodingvoltorb new - Creates a new game of Exploding Voltorb. Requires Staff.<br>${prefix}explodingvoltorb start - Starts a game of Exploding Voltorb. Requires Staff.<br>${prefix}explodingvoltorb end - Ends the game of Exploding Voltorb. Requires Staff.<br>${prefix}explodingvoltorb join/leave - Joins / leaves the game of Exploding Voltorb.<br>${prefix}explodingvoltorb timer - Sets the timer limit for Snorlax. By default, this is 10s.<br>${prefix}explodingvoltorb hand - Shows you your hand.<br>${prefix}explodingvoltorb draw - Draws a card.<br>${prefix}explodingvoltorb deck - Shows you the number of cards left in the deck.<br>${prefix}explodingvoltorb cards - Shows you the number of cards everyone has left.<br>${prefix}explodingvoltorb discard - Shows you the cards in the discard pile.<br>${prefix}explodingvoltorb place - Used when you use a Quagsire. Use this in PMs with the given syntax to replace the Voltorb in the deck.<br>${prefix}explodingvoltorb give - Used to pick which card to give a user when a Liepard is sprung on you. Use this in PMs with the given syntax.<br><br>${prefix}explodingvoltorb (Espurr/Lugia/Meowth/Skitty) - Plays the relevant card. If no one Snorlaxes within time, the card effect goes through.<br>${prefix}explodingvoltorb 2x(Espeon/Flareon/Jolteon/Umbreon/Vaporeon), (target) - Plays the 2x Eeveelution combo. \`Target\` here is the person you wish to steal a card from.<br>${prefix}explodingvoltorb 3x(Espeon/Flareon/Jolteon/Umbreon/Vaporeon), (card), (target) - Plays the 3x Eeveelution combo. \`Card\` here is the card that you want, and \`target\` is the person you wish to take the card from.<br>${prefix}explodingvoltorb Eevee Power, (card) - Plays the Eevee Power combo. \`Card\` here is the card that you want from the Discard Pile.<br>${prefix}explodingvoltorb Liepard, (target) - Plays a Liepard against (target). They decide what card to give you using ${prefix}explodingvoltorb (room), give (card) in my PMs.<br>${prefix}explodingvoltorb Snorlax - Plays a Snorlax. Can only be played within a certain time limit (the default is 10s). Snorlax can affect a Snorlax (i.e; if someone Snorlaxes a Snorlax, the original card goes through). Can't be played on Quagsire or Voltorb.<br>${prefix}explodingvoltorb Quagsire - Plays a Quagsire. This can only be used if you have drawn a Voltorb. Using this command saves you, and allows you to replace the Voltorb anywhere in the deck.<br></details><hr>`;
				if (room.startsWith('groupchat-')) help = help.replace(/<img style="vertical-align: middle;" src=".*?\>/g, '');
				if (tools.hasPermission(by, 'gamma', room) && tools.canHTML(room)) return Bot.say(room, '/adduhtml EVHELP, ' + help);
				else return Bot.sendHTML(by, help);
				break;
			}
			case 'new': case 'n': case 'create': case 'c': {
				if (cf) return;
				if (!(['boardgames'].includes(room) && tools.hasPermission(by, 'gamma', room)) && !tools.hasPermission(by, 'beta', room)) return Bot.pm(by, 'Access denied.');
				if (Bot.rooms[room].ev) return Bot.say(room, `One's already active!`);
				Bot.rooms[room].ev = {
					started: false,
					index: null,
					PL: [],
					drawing: false,
					timerTime: 10000,
					room: room,
					order: null,
					turn: null,
					explosion: null,
					activeAction: false,
					nopes: 0,
					turns: 0,
					meowth: 0,
					timer: null,
					quag: false,
					players: {},
					deck: [],
					discard: [],
					start: function () {
						if (this.started) return;
						this.started = true;
						const deal = tools.deal(Object.keys(this.players));
						this.deck = Array.from(deal.deck).shuffle();
						Object.keys(deal.players).forEach(player => this.players[player].cards = Array.from(deal.players[player]));
						this.order = Object.keys(this.players).shuffle();
						Bot.say(this.room, 'The game of Exploding Voltorb has started! Turn order: ' + this.order.map(player => this.players[player].name).join(', '));
						for (let i = 1; i < this.order.length; i++) Bot.sendHTML(this.order[i], 'Your cards: ' + tools.handHTML(this.players[this.order[i]].cards));
						return this.nextTurn();
					},
					nextTurn: function () {
						if (!this.started) return null;
						if (this.turn === null) this.turn = this.order[0];
						else if (this.order.includes(this.turn)) {
							this.players[this.turn].actions = [];
							if (this.order[this.order.length - 1] == this.turn) this.turn = this.order[0];
							else this.turn = this.order[this.order.indexOf(this.turn) + 1];
						} else if (this.index == null) return null;
						if (this.index !== null) this.turn = this.order[this.index];
						this.index = null;
						this.drawing = false;
						if (Object.keys(this.players).length < 2) return this.end();
						if (this.meowth) this.turns = 2 * this.meowth;
						else this.turns = 1;
						this.meowth = 0;
						this.aTime = 0;
						this.activeAction = false;
						this.nopes = 0;
						Bot.say(this.room, `${this.players[this.turn].name}, your turn! Play your actions!`);
						Bot.pm(this.turn, `It's your turn!`);
						Bot.sendHTML(this.turn, 'Your hand: ' + tools.handHTML(this.players[this.turn].cards));
						const actions = tools.getActions(this.players[this.turn].cards);
						return Bot.pm(this.turn, `Available actions: ${actions.length ? tools.listify(actions) : 'None'}.`);
					},
					end: function () {
						Bot.say(this.room, `GG! Thanks to ${tools.listify(this.PL)} for participating! All of 'em get 10 points!`);
						const winner = this.players[Object.keys(this.players)[0]].name;
						Bot.say(this.room, `And congratulations to ${winner} for not going kaboom! They get 5 extra points!`);
						const pointsObj = Object.fromEntries(this.PL.map(player => [player, 10]));
						pointsObj[winner] ??= 0;
						pointsObj[winner] += 5;
						tools.addPoints(0, pointsObj, room, '_ExplodingVoltorb');
						return delete Bot.rooms[this.room].ev;
					}
				};
				return Bot.say(room, `A game of Exploding Voltorb has been created! Use \`\`${prefix}explodingvoltorb join\`\` to join!`);
				break;
			}
			case 'join': case 'j': {
				if (cf) return;
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, `/me can't find an active game of Exploding Voltorb`);
				if (ev.started) return Bot.pm(by, `Looks like you were a bit too late...`);
				if (ev.players[toID(by)]) return Bot.pm(by, `You've already joined. -_-`);
				if (Object.keys(ev.players).length >= 5) return Bot.pm(by, 'Sorry, full squad.');
				ev.players[toID(by)] = {
					name: by.substr(1).replace(/^\s*/, ''),
					cards: [],
					actions: []
				};
				ev.PL.push(by.substr(1).replace(/^\s*/, ''));
				Bot.say(room, `${by.substr(1)} has joined the game!`);
				if (Object.keys(ev.players).length == 5) Bot.say(room, 'The squad is full!');
				return;
				break;
			}
			case 'leave': case 'l': {
				if (cf) return;
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, `/me can't find an active game of Exploding Voltorb`);
				if (ev.started) return Bot.pm(by, `Looks like you were a bit too late, can't leave now...`);
				if (!ev.players[toID(by)]) return Bot.pm(by, `You're not in the game, though. o.o`);
				ev.PL.remove(ev.players[toID(by)].name);
				delete ev.players[toID(by)];
				return Bot.say(room, `${by.substr(1)} has left the game. :(`);
				break;
			}
			case 'timer': case 't': {
				if (cf) return;
				if (!(['boardgames'].includes(room) && tools.hasPermission(by, 'gamma', room)) && !tools.hasPermission(by, 'beta', room)) return Bot.pm(by, 'Access denied.');
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, `/me searches for an active game of Exploding Voltorb`);
				if (!args[0]) return Bot.pm(by, unxa);
				const timerTime = parseInt(args.join('').replace(/[^0-9]/g, ''));
				if (isNaN(timerTime)) return Bot.pm(by, `That doesn't look like a valid number of seconds, nerd.`);
				if (timerTime > 30 || timerTime < 5) return Bot.pm(by, 'Whoa, whoa, I don\'t think that timer is alright. Stay within 5 - 30s!');
				ev.timerTime = timerTime * 1000;
				return Bot.say(room, `The new EV timer is ${timerTime} seconds!`);
			}
			case 'start': case 's': {
				if (!(['boardgames'].includes(room) && tools.hasPermission(by, 'gamma', room)) && !tools.hasPermission(by, 'beta', room)) return Bot.pm(by, 'Access denied.');
				if (!Bot.rooms[room].ev) return Bot.say(room, `No one's playing Exploding Voltorb here. o.o`);
				if (Object.keys(Bot.rooms[room].ev.players).length < 2) return Bot.say(room, 'Not enough players!');
				return Bot.rooms[room].ev.start();
				break;
			}
			case 'hand': {
				const ev = Bot.rooms[room].ev, player = toID(by);
				if (!ev) return Bot.pm(by, `No one's playing Exploding Voltorb here. o.o`);
				if (!ev.players[player]) return Bot.pm(by, '/me squints');
				return Bot.sendHTML(by, 'Your hand: ' + tools.handHTML(ev.players[player].cards));
				break;
			}
			case 'order': case 'o': {
				const ev = Bot.rooms[room].ev, player = toID(by);
				if (!ev) return Bot.pm(by, `No one's playing Exploding Voltorb here. o.o`);
				if (!ev.started) return Bot.pm(by, 'Not yet.');
				if (tools.hasPermission(by, 'gamma', room) && tools.canHTML(room)) return Bot.say(room, '/adduhtml EV, The turn order is: ' + ev.order.map(player => ev.players[player].name).join(', ') + '.');
				else return Bot.pm(by, 'The turn order is: ' + ev.order.map(player => ev.players[player].name).join(', ') + '.');
				break;
			}
			case 'action': case 'a': case 'play': case 'p': {
				if (cf) return;
				if (!args[0]) return Bot.pm(by, unxa);
				const action = toID(args[0]), actions = ['skitty', 'meowth', 'lugia', 'espurr', 'liepard', '2xespeon', '3xespeon', '2xflareon', '3xflareon', '2xjolteon', '3xjolteon', '2xumbreon', '3xumbreon', '2xvaporeon', '3xvaporeon', 'eeveepower', 'eevee', 'deg'];
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (!ev.started) return Bot.pm(by, `Looks like someone's a bit eager, eh? Give it a bit; hasn't started.`);
				if (ev.turn !== toID(by)) return Bot.pm(by, `You don't look like ${ev.players[ev.turn].name}.`);
				if (ev.drawing) return Bot.pm(by, 'You can\'t play any more actions! Keep drawing.');
				if (!actions.includes(action)) return Bot.pm(by, 'Invalid action.');
				if (ev.activeAction) return Bot.pm(by, `You are already using ${ev.activeAction}! `);
				if (ev.quag) return Bot.pm(by, 'Place your Voltorb!');
				if (ev.explosion) return Bot.pm(by, 'YOU\'VE DRAWN A VOLTORB NERD QUAG IT');
				if (!tools.getActions(ev.players[ev.turn].cards).map(act => toID(act)).concat('eevee').includes(action)) return Bot.pm(by, 'Illegal action!');
				if (ev.timer) {
					tools.runEarly(ev.timer);
					delete ev.timer;
				}
				switch (action) {
					case 'skitty': {
						ev.timer = setTimeout(() => {
							const ev = Bot.rooms[room].ev;
							if (ev.nopes % 2) {
								ev.nopes = 0;
								delete ev.timer;
								return Bot.say(room, `Skitty was Snorlaxed!`);
							}
							ev.nopes = 0;
							Bot.say(room, `${ev.players[ev.turn].name}'${ev.turn.endsWith('s') ? '' : 's'} turn has ended!`);
							delete ev.timer;
							ev.turns--;
							ev.nextTurn();
						}, ev.timerTime, room);
						ev.players[ev.turn].cards.remove('skitty');
						ev.discard.push('skitty');
						return Bot.say(room, `${ev.players[ev.turn].name} has played a Skitty!`);
						break;
					}
					case 'lugia': {
						ev.timer = setTimeout(() => {
							const ev = Bot.rooms[room].ev;
							if (ev.nopes % 2) {
								ev.nopes = 0;
								delete ev.timer;
								return Bot.say(room, `Lugia was Snorlaxed!`);
							}
							ev.nopes = 0;
							ev.deck.shuffle();
							Bot.say(room, 'The deck was shuffled!');
							Bot.sendHTML(by, tools.handHTML(ev.players[ev.turn].cards));
							const actions = tools.getActions(ev.players[ev.turn].cards);
							Bot.pm(by, `Available actions: ${actions.length ? tools.listify(actions) : 'None'}.`);
							delete ev.timer;
						}, ev.timerTime, room);
						ev.players[ev.turn].cards.remove('lugia');
						ev.discard.push('lugia');
						return Bot.say(room, `${ev.players[ev.turn].name} has played a Lugia!`);
						break;
					}
					case 'espurr': {
						ev.timer = setTimeout(() => {
							const ev = Bot.rooms[room].ev;
							if (ev.nopes % 2) {
								ev.nopes = 0;
								delete ev.timer;
								return Bot.say(room, `Espurr was Snorlaxed!`);
							}
							ev.nopes = 0;
							Bot.sendHTML(ev.turn, '(from the top ->)' + tools.handHTML(ev.deck.slice(ev.deck.length - 3, ev.deck.length).reverse()));
							Bot.sendHTML(ev.turn, tools.handHTML(ev.players[ev.turn].cards));
							const actions = tools.getActions(ev.players[ev.turn].cards);
							Bot.pm(by, `Available actions: ${actions.length ? tools.listify(actions) : 'None'}.`);
							delete ev.timer;
						}, ev.timerTime, room);
						ev.players[ev.turn].cards.remove('espurr');
						ev.discard.push('espurr');
						return Bot.say(room, `${ev.players[ev.turn].name} has played an Espurr!`);
						break;
					}
					case 'meowth': {
						ev.timer = setTimeout(() => {
							const ev = Bot.rooms[room].ev;
							if (ev.nopes % 2) {
								ev.nopes = 0;
								delete ev.timer;
								return Bot.say(room, `Meowth was Snorlaxed!`);
							}
							ev.nopes = 0;
							ev.meowth++;
							Bot.say(room, `${ev.players[ev.turn].name}'${ev.turn.endsWith('s') ? '' : 's'} turn has ended!`);
							delete ev.timer;
							ev.nextTurn();
						}, ev.timerTime, room);
						ev.players[ev.turn].cards.remove('meowth');
						ev.discard.push('meowth');
						return Bot.say(room, `${ev.players[ev.turn].name} has played a Meowth!`);
						break;
					}
					case '2xespeon': case '2xflareon': case '2xjolteon': case '2xumbreon': case '2xvaporeon': {
						const eevee = data.pokedex[toID(args.shift().slice(2))].name;
						if (args.length < 1) return Bot.pm(by, `That isn't the correct format to play two Eeveelutions! Use \`\`${prefix}explodingvoltorb action 2x${eevee} (target)\`\`!`);
						const target = toID(args.join(' '));
						if (!target || !ev.players[target]) return Bot.pm(by, 'Invalid target.');
						ev.timer = setTimeout(() => {
							const ev = Bot.rooms[room].ev;
							if (ev.nopes % 2) {
								ev.nopes = 0;
								delete ev.timer;
								return Bot.say(room, `Both ${eevee} were Snorlaxed!`);
							}
							ev.nopes = 0;
							const hand = ev.players[target].cards, card = hand[Math.floor(Math.random() * hand.length)];
							ev.players[target].cards.remove(card);
							ev.players[ev.turn].cards.push(card);
							const actions = tools.getActions(ev.players[ev.turn].cards);
							Bot.sendHTML(ev.turn, 'Stolen card: ' + tools.handHTML([card]));
							Bot.sendHTML(target, 'Stolen card: ' + tools.handHTML([card]));
							Bot.sendHTML(ev.turn, tools.handHTML(ev.players[ev.turn].cards));
							Bot.say(room, `${ev.players[ev.turn].name} has stolen a card from ${ev.players[target].name}!`);
							Bot.pm(by, `Available actions: ${actions.length ? tools.listify(actions) : 'None'}.`);
							delete ev.timer;
						}, ev.timerTime, room, target);
						ev.players[ev.turn].cards.remove(eevee.toLowerCase(), eevee.toLowerCase());
						ev.discard.push(eevee.toLowerCase(), eevee.toLowerCase());
						return Bot.say(room, `${ev.players[ev.turn].name} has played two ${eevee}!`);
						break;
					}
					case '3xespeon': case '3xflareon': case '3xjolteon': case '3xumbreon': case '3xvaporeon': {
						const eevee = data.pokedex[toID(args.shift().slice(2))].name;
						if (args.length < 2) return Bot.pm(by, `That isn't the correct format to play three Eeveelutions! Use \`\`${prefix}explodingvoltorb action 3x${eevee} (desired card) (target)\`\`!`);
						let want = args.shift(), target = toID(args.join(' '));
						if (!['espeon', 'espurr', 'flareon', 'jolteon', 'liepard', 'lugia', 'meowth', 'quagsire', 'skitty', 'snorlax', 'umbreon', 'vaporeon'].includes(toID(want))) return Bot.pm(by, `You want ${want}? You can't steal it, sorry...`);
						want = toID(want);
						if (!target || !ev.players[target]) return Bot.pm(by, 'Invalid target.');
						ev.timer = setTimeout((room, target, want) => {
							const ev = Bot.rooms[room].ev;
							if (ev.nopes % 2) {
								ev.nopes = 0;
								delete ev.timer;
								return Bot.say(room, `All three ${eevee} were Snorlaxed!`);
							}
							ev.nopes = 0;
							const hand = ev.players[target].cards;
							if (hand.includes(want)) {
								ev.players[target].cards.remove(want);
								ev.players[ev.turn].cards.push(want);
								Bot.say(room, `${ev.players[ev.turn].name} stole ${ev.players[target].name}'${target.endsWith('s') ? ''  : 's'} ${data.pokedex[want].name}!`);
							} else Bot.say(room, `${ev.players[ev.turn].name} tried to steal ${ev.players[target].name}'${target.endsWith('s') ? ''  : 's'} ${data.pokedex[want].name} (but they didn't have one, F)!`);
							const actions = tools.getActions(ev.players[ev.turn].cards);
							Bot.sendHTML(ev.turn, tools.handHTML(ev.players[ev.turn].cards));
							Bot.pm(by, `Available actions: ${actions.length ? tools.listify(actions) : 'None'}.`);
							delete ev.timer;
						}, ev.timerTime, room, target, want);
						ev.players[ev.turn].cards.remove(eevee.toLowerCase(), eevee.toLowerCase(), eevee.toLowerCase());
						ev.discard.push(eevee.toLowerCase(), eevee.toLowerCase(), eevee.toLowerCase());
						return Bot.say(room, `${ev.players[ev.turn].name} has played three ${eevee}!`);
						break;
					}
					case 'eevee': case 'eeveepower': case 'deg': {
						if (toID(args[1]) == 'power') args.shift();
						args.shift();
						if (!args.length) return Bot.pm(by, `Eevee Power! You need to specify the card that you want, though. Like \`\`${prefix}explodingvoltorb Eevee Power (card)\`\`.`);
						const want = toID(args.join(' '));
						if (!ev.discard.includes(want)) return Bot.pm(by, `Couldn't find that in the Discard pile, sorry.`);
						ev.timer = setTimeout((room, want) => {
							const ev = Bot.rooms[room].ev;
							if (ev.nopes % 2) {
								ev.nopes = 0;
								delete ev.timer;
								return Bot.say(room, `The Eeveelutions were Snorlaxed!`);
							}
							ev.nopes = 0;
							ev.discard.remove(want);
							ev.players[ev.turn].cards.push(want);
							Bot.say(room, `${ev.players[ev.turn].name} rummaged through the Discard pile and took ${data.pokedex[want].name}!`);
							const actions = tools.getActions(ev.players[ev.turn].cards);
							Bot.sendHTML(ev.turn, tools.handHTML(ev.players[ev.turn].cards));
							Bot.pm(by, `Available actions: ${actions.length ? tools.listify(actions) : 'None'}.`);
							delete ev.timer;
						}, ev.timerTime, room, want);
						ev.players[ev.turn].cards.remove('espeon', 'flareon', 'jolteon', 'umbreon', 'vaporeon');
						ev.discard.push('espeon', 'flareon', 'jolteon', 'umbreon', 'vaporeon');
						return Bot.say(room, `${ev.players[ev.turn].name} has played all five Eeveelutions!`);
						break;
					}
					case 'liepard': {
						if (args.length < 1) return Bot.pm(by, `That isn't the correct format to play Liepard! Use \`\`${prefix}explodingvoltorb action Liepard (target)\`\`!`);
						args.shift();
						const target = toID(args.join(' '));
						if (!target || !ev.players[target]) return Bot.pm(by, 'Invalid target.');
						if (!ev.players[target].cards.length) return Bot.say(room, 'Imagine trying to steal from someone with no cards.');
						ev.timer = setTimeout((room, target) => {
							const ev = Bot.rooms[room].ev;
							if (ev.nopes % 2) {
								ev.nopes = 0;
								delete ev.timer;
								return Bot.say(room, `Liepard was Snorlaxed!`);
							}
							ev.nopes = 0;
							ev.liepard = target;
							ev.activeAction = 'Liepard';
							Bot.pm(target, `${ev.players[ev.turn].name} has used a Liepard on you! Use \`\`${prefix}explodingvoltorb ${room.startsWith('groupchat-') ? room : Bot.rooms[room].title}, give (card)\`\` to decide which card to give them.`);
							delete ev.timer;
						}, ev.timerTime, room, target);
						ev.players[ev.turn].cards.remove('liepard');
						ev.discard.push('liepard');
						return Bot.say(room, `${ev.players[ev.turn].name} has played a Liepard on ${ev.players[target].name}!`);
						break;
					}
					default: {
						return;
						break;
					}
				}
				break;
			}
			case 'draw': case 'd': {
				if (cf) return;
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (!ev.started) return Bot.pm(by, 'Hold your horses! It ain\'t started, yet!');
				if (ev.turn !== toID(by)) return Bot.pm(by, `You don't look like ${ev.players[ev.turn].name}.`);
				if (ev.timer || ev.activeAction) return Bot.pm(by, 'You have an ongoing action! Wait for a bit.');
				if (ev.quag) return Bot.pm(by, `You haven't put your Voltorb back. -_-`);
				if (ev.explosion) return Bot.pm(by, 'YOU\'VE DRAWN A VOLTORB NERD QUAG IT');
				ev.turns--;
				ev.drawing = true;
				const draw = ev.deck.pop();
				if (draw == 'voltorb') {
					Bot.say(room, `**${ev.players[ev.turn].name} has drawn a Voltorb!**`);
					Bot.pm(by, `You have drawn a Voltorb! Use \`\`${prefix}explodingvoltorb Quagsire\`\` to Damp it!`);
					ev.explosion = setTimeout(function (user, room) {
						const ev = Bot.rooms[room].ev;
						if (!ev) return;
						Bot.say(room, `${ev.players[user].name} goes kaboom!`);
						ev.turns = 0;
						clearTimeout(ev.timer);
						delete ev.timer;
						let index = ev.order.indexOf(user);
						ev.order.remove(user);
						ev.explosion = null;
						if (index == ev.order.length) index = 0;
						delete ev.players[user];
						ev.index = index;
						ev.nextTurn();
						return true;
					}, ev.timerTime * 2, ev.turn, room);
					return ev.players[ev.turn].cards.push(draw);
				}
				ev.players[ev.turn].cards.push(draw);
				if (ev.turns > 0) {
					Bot.sendHTML(ev.turn, tools.handHTML(ev.players[ev.turn].cards));
					return Bot.say(room, 'Draw again!');
				}
				Bot.sendHTML(ev.turn, 'Your hand: ' + tools.handHTML(ev.players[ev.turn].cards));
				ev.nextTurn();
				break;
			}
			case 'end': case 'e': {
				if (!(['boardgames'].includes(room) && tools.hasPermission(by, 'gamma', room)) && !tools.hasPermission(by, 'beta', room)) return Bot.pm(by, 'Access denied.');
				if (!Bot.rooms[room].ev) return Bot.say(room, `No one's playing Exploding Voltorb here. o.o`);
				clearTimeout(Bot.rooms[room].ev.timer);
				delete Bot.rooms[room].ev;
				return Bot.say(room, 'Ended the game of Exploding Voltorb! No points will be awarded.');
				break;
			}
			case 'snorlax': case 'x': {
				if (cf) return;
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (!ev.started) return Bot.pm(by, 'Whoa, whoa, not yet. Let it start!');
				if (!ev.players[toID(by)]) return Bot.pm(by, `You don't look like a player...`);
				const user = ev.players[toID(by)];
				if (!user.cards.includes('snorlax')) return Bot.pm(by, `You don't have a Snorlax!`);
				if (!ev.timer) return Bot.pm(by, `Can't Snorlax now.`);
				Bot.say(room, `${ev.players[ev.turn].name}, ${toID(by) == ev.turn ? 'you' : by.substr(1)} ha${toID(by) == ev.turn ? 've' : 's'} played a Snorlax!`);
				user.cards.remove('snorlax');
				ev.nopes++;
				ev.discard.push('snorlax');
				ev.timer.refresh();
				return;
				break;
			}
			case 'quagsire': case 'quag': case 'q': {
				if (cf) return;
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (!ev.started) return Bot.pm(by, 'Let it start.');
				if (ev.turn !== toID(by)) return Bot.pm(by, `You don't look like ${ev.players[ev.turn].name}.`);
				if (!ev.explosion) return Bot.pm(by, 'You\'re not going kaboom. o.o');
				if (!ev.players[ev.turn].cards.includes('quagsire')) return Bot.pm(by, `Nope, none left. You're going kaboom.`);
				clearTimeout(ev.explosion);
				ev.explosion = null;
				ev.discard.push('quagsire');
				ev.players[ev.turn].cards.remove('voltorb');
				Bot.say(room, 'A Quagsire has Damped the Voltorb!');
				ev.players[ev.turn].cards.remove('quagsire');
				Bot.pm(ev.turn, `You have Damped the Voltorb. Use \`\`${prefix}explodingvoltorb ${room.startsWith('groupchat-') ? room : Bot.rooms[room].title}, place (location)\`\` to replace it somewhere in the deck. (Setting the location to 1 makes it the top card, setting it to 2 makes it second, etc. You may use 0 or 'random' to place it randomly.)`);
				return ev.quag = true;
				break;
			}
			case 'place': {
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (ev.turn !== toID(by)) return Bot.pm(by, `You don't look like ${ev.players[ev.turn].name}.`);
				if (!ev.quag) return Bot.pm(by, 'Quag?');
				if (!args.length) return Bot.pm(by, unxa);
				let loc = toID(args.join(''));
				if (loc === 'r' || loc === 'random' || loc == '0') loc = Math.ceil(Math.random() * ev.deck.length);
				else loc = parseInt(loc);
				if (loc > ev.deck.length) loc = ev.deck.length;
				ev.deck.push('voltorb');
				ev.quag = false;
				[ev.deck[ev.deck.length - 1], ev.deck[ev.deck.length - loc]] = [ev.deck[ev.deck.length - loc], ev.deck[ev.deck.length - 1]];
				Bot.say(room, 'The Voltorb has been replaced!');
				if (ev.turns > 0) {
					Bot.sendHTML(ev.turn, tools.handHTML(ev.players[ev.turn].cards));
					return Bot.say(room, 'Draw again!');
				}
				ev.nextTurn();
				break;
			}
			case 'give': {
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (!ev.started) return Bot.pm(by, '(it hasn\t started yet)');
				if (!ev.liepard || ev.liepard !== toID(by)) return Bot.pm(by, 'Nope.');
				const card = toID(args.join(''));
				if (card == 'voltorb') return Bot.pm(by, '>trying to give a Voltorb');
				if (!['espeon', 'espurr', 'flareon', 'jolteon', 'liepard', 'lugia', 'meowth', 'quagsire', 'skitty', 'snorlax', 'umbreon', 'vaporeon'].includes(card)) return Bot.pm(by, `...that's not a valid card?`);
				const player = ev.players[toID(by)];
				if (!player.cards.includes(card)) return Bot.pm(by, `You don't have one, though. O.o`);
				player.cards.remove(card);
				ev.players[ev.turn].cards.push(card);
				ev.activeAction = null;
				Bot.pm(ev.turn, `${by.substr(1)} gave you their ${data.pokedex[card].name}!`);
				Bot.say(room, `${by.substr(1)} gave ${ev.players[ev.turn].name} one of their cards!`);
				Bot.sendHTML(ev.turn, 'Your hand: ' + tools.handHTML(ev.players[ev.turn].cards));
				const actions = tools.getActions(ev.players[ev.turn].cards);
				Bot.pm(ev.turn, `Available actions: ${actions.length ? tools.listify(actions) : 'None'}.`);
				break;
			}
			case 'deck': {
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (!ev.started) return Bot.pm(by, 'Let the game start. o.O');
				if (tools.hasPermission(by, 'gamma', room)) return Bot.say(room, `There ${ev.deck.length == 1 ? 'is' : 'are'} ${ev.deck.length || 'no'} card${ev.deck.length == 1 ? '' : 's'} in the deck.`);
				return Bot.pm(by, `There ${ev.deck.length == 1 ? 'is' : 'are'} ${ev.deck.length || 'no'} card${ev.deck.length == 1 ? '' : 's'} in the deck.`);
				break;
			}
			case 'discard': {
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (!ev.started) return Bot.pm(by, 'Let the game start. o.O');
				return Bot.sendHTML(by, `Discard pile: ` + tools.handHTML(ev.discard));
				break;
			}
			case 'substitute': case 'sub': {
				if (!(['boardgames'].includes(room) && tools.hasPermission(by, 'gamma', room)) && !tools.hasPermission(by, 'beta', room)) return Bot.pm(by, 'Access denied.');
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (!ev.started) return Bot.pm(by, 'Let the game start. o.O');
				const cargs = args.join(' ').split(',');
				if (!cargs[1]) return Bot.say(room, unxa);
				const p1 = toID(cargs[0]), p2 = toID(cargs[1]);
				if (ev.players[p1] && ev.players[p2]) return Bot.say(room, 'Both of those are playing. o.o');
				if (!ev.players[p1] && !ev.players[p2]) return Bot.say(room, 'Neither of those are playing. o.o');
				if (ev.players[p1]) {
					ev.players[p2] = Object.assign({}, ev.players[p1]);
					ev.players[p2].name = cargs[1];
					ev.order[ev.order.indexOf(p1)] = p2;
					ev.PL[ev.PL.indexOf(ev.players[p1].name)] = cargs[1];
					if (ev.turn == p1) ev.turn = p2;
					delete ev.players[p1];
					return Bot.say(room, `${cargs[0]} was substituted with ${cargs[1]}.`);
				} else {
					ev.players[p1] = Object.assign({}, ev.players[p2]);
					ev.players[p1].name = cargs[0];
					ev.order[ev.order.indexOf(p2)] = p1;
					ev.PL[ev.PL.indexOf(ev.players[p2].name)] = cargs[0];
					if (ev.turn == p2) ev.turn = p1;
					delete ev.players[p2];
					return Bot.say(room, `${cargs[1]} was substituted with ${cargs[0]}.`);
				}
				break;
			}
			case 'playerlist': case 'pl': {
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (tools.canHTML(room)) Bot.say(room, `/adduhtml EV, The current PL is: ${Object.keys(ev.players).map(player => ev.players[player].name).join(', ')}`);
				else return Bot.pm(by, `The current PL is: ${Object.keys(ev.players).map(player => ev.players[player].name).join(', ')}`);
				return;
				break;
			}
			case 'players': {
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (tools.canHTML(room)) Bot.say(room, `/adduhtml EV, The players are: ${ev.PL}`);
				else return Bot.pm(by, `The players are: ${ev.PL}`);
				return;
				break;
			}
			case 'actions': {
				const ev = Bot.rooms[room].ev, player = toID(by);
				if (!ev) return Bot.pm(by, `No one's playing Exploding Voltorb here. o.o`);
				if (!ev.players[player]) return Bot.pm(by, '/me squints');
				const actions = tools.getActions(ev.players[player].cards);
				return Bot.pm(by, `Available actions: ${actions.length ? tools.listify(actions) : 'None'}.`);
				break;
			}
			case 'cards': {
				const ev = Bot.rooms[room].ev;
				if (!ev) return Bot.pm(by, 'Exploding Voltorb ain\'t active.');
				if (!ev.started) return Bot.pm(by, 'Let the game start. o.O');
				const html = `<b>Cards:</b> <br><ul>${ev.order.map(player => `<li>${ev.players[player].name}: ${ev.players[player].cards.length}</li>`).join('')}</ul>`;
				if (tools.hasPermission(by, 'gamma', room) && tools.canHTML(room)) return Bot.say(room, `/adduhtml EV, ${html}`);
				return Bot.sendHTML(by, html);
				break;
			}
			default: {
				return Bot.pm(by, `Doesn't look like that's an option...`);
				break;
			}
		}
	}
};
