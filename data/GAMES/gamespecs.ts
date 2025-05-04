type Context = {
	[key: string]: any
};
type Rank = string | (userId: string, context: Context): boolean => {};
type Event = (game: Game, context: Context) => void;

let gameSpecs: {
	id: string,
	gameId?: (context: Context) => string,
	notif: string,
	name: string,
	aliases: [string],
	players: number | [number, number],
	sides: Array<string>
	permissions: {
		create?: Rank,
		join?: Rank,
		mod?: Rank,
		sub?: Rank,
		end?: Rank,
	},
	assign: {
		[key: string]: any
	},
	help: string,
	winner: (game: Game, context: Context) => any,
	createPlayer: (game: Game, conext: Context) => Player,
	render: (game: Game, context: Context) => HTML,
	createBoard: (context: Context) => Board,
	play: (game: Game, context: Context) => any,

	findGame: (game: Game, type: string, context: Context) => boolean,

	themes: {
		[key: string]: any
	},
	defaultTheme: string,

	multiBoard?: boolean,
	randomOrder?: boolean,
	startAt?: number,

	statics: {
		[key: string]: (any) => any
	},


	events: {
		onCreate?: Event,

		onAddPlayer?: Event,
		tryRemovePlayer?: Event,
		onRemovePlayer?: Event,

		onPlay?: Event,

		tryNextTurn?: Event,
		onNextTurn?: Event,

		tryEnd?: Event,
		onEnd?: Event,
	}
};