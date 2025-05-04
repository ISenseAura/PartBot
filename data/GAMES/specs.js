const gameSpecs = {
	id: 'chess',
	name: 'Chess',
	players: 2,
	sides: ['white', 'black']
	permissions: {
		new = 'gamma',
		join = 'none',
		mod = 'gamma',
		sub = 'beta',
		end = 'beta',
	},
	assign: {
		moves: [],
		lastMove: [],
		lastMoveP2: false
	},
	help: 'string',
	findGame: (game) => Boolean,
	play: (game, context) => {},
	winner: (game, context) => {},
	postGame: (game) => {},
	join: (user, context) => <Game>,
	leave: (user, context) => <Game>,
	render: (game, context) => string,
	themes: {
		green: {}
	},
	defaultTheme: 'green',
	// multiBoard: false
	// randomOrder: false,
	createBoard: (userId, context) => {},
	statics: {
		toFEN
	},
	events: {
		onPlay: (game, moveContext) => {
			game.moves.push(moveContext)
		},
		tryNextTurn: (game, context) => {},
		afterNextTurn
		onNextTurn: (game, context) => {}

		tryEnd,
		onEnd
	},
	// startAt: 1
}