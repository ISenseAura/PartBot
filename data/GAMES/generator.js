const gameUI = $ => {
	return {
		checkIfCan: function (user, room, action) {
			const defaults = {
				create: 'gamma',
				join: 'none',
				mod: 'gamma',
				sub: 'beta',
				end: 'beta'
			};
			const perms = Object.assign(defaults, $.permissions);
			const rank = perms[action];
			if (typeof rank === 'function') return rank(toID(user), context);
			else return tools.hasPermission(user, room, rank);
		}
		help: $.help,
		permissions: 'none',
		commandFunction: function (Bot, room, time, by, args, client, isPM) {
			const roomReply = text => Bot.roomReply(room, by, text);
			const errorLogger = err => {
				roomReply(err.message);
				Bot.log(err);
			};

			const gamesList = Object.values(Bot.rooms[room].[$.id] ?? {});
			if (!$.findGame) {
				$.findGame = (game, type, context) => {
					const { by, args } = context;
					const [, id] = args ?? [];
					if (id && (Bot.rooms[room].[$.id] ?? {})[id]) return id === game.id;
					switch (type) {
						case 'join': return !game.started && !game.players[by];
						case 'start': return !game.started && Object.keys
					}
				};
			}
			const findGame = (type, context, exact = false) => {
				const list = gamesList.filter(game => $.findGame(game, type, context));
				if (exact && list.length !== 1) return false;
				return list[0];
			};
			const findGames = (type, context) => gamesList.filter(game => $.findGame(game, type, context));

			if (!args.length) args.push('help');
			switch (toID(args[0])) {
				case 'help': case 'h': case 'aaaa': {
					if (tools.hasPermission(by, 'gamma', room) && !isPM) Bot.say(room, $.help);
					else roomReply($.help);
					break;
				}
				case 'new': case 'n': case 'create': case 'newgame': {
					if (!checkIfCan(by, room, 'create')) return roomReply('Access denied.');
					if (isPM) return roomReply('Do it in the room ya nerd');
					if (!tools.canHTML(room)) return Bot.say(room, 'I need * perms for this...');
					if (!Bot.rooms[room][$.id]) Bot.rooms[room][$.id] = {};
					const id = $.gameId?.({ by, room }) ?? Date.now();
					const newGame = GAMES.create($.id, id, room);
					Bot.rooms[room][$.id][id] = newGame;
					newGame.runEvent('onCreate', { by, args });
					Bot.say(room, `/notifyrank all, ${$.notif}`);
					newGame.save();
					break;
				}
				case 'join': case 'j': case 'iwanttoplaytoo': {
					const $$ = findGame('join', { user: by, args }, true);
					if (!$$) return roomReply('No game specified/found');
					$$.addPlayer({ name: by.substr(1) });
					$$.save();
					break;
				}
				case 'leave': case 'l': case 'part': {
					const $$ = findGame('leave', { user: by, args });
				}
			}
		}
	}
};

const gameTemplate = $ => {
	return class Game {
		constructor (id, room, restore = {}) {
			this.id = id;
			Object.assign(this, $.assign);
			this.room = room;
			this.started = 0;
			this.players = {};
			this.spectators = {};
			this.sides = $.sides;
			this.themes = $.themes;
			this.theme = this.themes[$.defaultTheme];
			if ($.sides.length > 1) {
				if ($.multiBoard) this.boards = {};
				this.order = [...this.sides];
				if ($.randomOrder) this.order.shuffle();
			}

			this.statics = $.statics ?? {};
			this.methods = $.methods ?? {};

			Object.assign(this, restore);
		}
		runEvent (event, context) {
			return $.events?.[event]?.(this, context);
		}
		addPlayer (context) {
			const userId = toID(context.name);
			if (this.players[userId]) throw new Error('User has already joined');
			this.players[userId] = $.createPlayer(this, context);
			this.runEvent('onAddPlayer', context);
			this.save();
		}
		removePlayer (context) {
			this.runEvent('tryRemovePlayer', context);
			const userId = toID(context.name);
			if (!this.players[userId]) throw new Error('User cannot be removed (they were never added)');
			delete this.players[userId];
			this.runEvent('onRemovePlayer', context);
			this.save();
		}
		setBoard (context) {
			const newBoard = $.createBoard(context);
			if ($.multiBoard) this.boards[context.userId] = newBoard;
			else this.board = newBoard;
		}
		proceed () {
			this.started++;
			if (($.startAt ?? 1) === this.started) {
				this.order = Object.values(this.players).map(p => p.side);
				if ($.randomOrder) this.order.shuffle();
				this.turn = this.order[0];
			}
			this.save();
		}
		getNextTurn (turn = this.turn ?? this.order?.[0]) {
			if (!turn) throw new Error('Missing turn');
			const oldIndex = this.order.indexOf(turn);
			if (oldIndex < 0) throw new Error('Could not find turn in order');
			const newIndex = (oldIndex + 1) % this.order.length;
			return this.order[newIndex];
		}
		nextTurn (context) {
			$.runEvent('tryNextTurn', context);
			this.turn = this.getNextTurn();
			$.runEvent('onNextTurn', context);
		}
		HTML (userId, context) {
			return $.render(game, { userId, ...context });
		}
		sendHTML (html, user, id) {
			// TODO: Fill body
		}
		play (context) {
			const result = $.play(this, context);
			const newContext = { result, ...context };
			$.runEvent('onPlay', newContext);
			this.nextTurn(newContext);
			$.save();
		}
		end (context) {
			$.runEvent('tryEnd', context);
			const winner = $.winner(this, context);
			this.started = true;
			this.ended = true;
			$.yeet();
			$.runEvent('onEnd', { winner, ...context });
			delete Bot.rooms[this.room][$.id][this.id];
		}

		save () {
			return fsp.writeFile(`./data/BACKUPS/${$.id}-${this.room}-${this.id}.json`, JSON.stringify(this)).catch(Bot.log);
		}
		yeet () {
			return fsp.unlink(`./data/BACKUPS/${$.id}-${this.room}-${this.id}.json`);
		}
	}
};
