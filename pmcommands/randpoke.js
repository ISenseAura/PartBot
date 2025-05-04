module.exports = {
	help: `Random Pokémon for Unite!`,
	permissions: 'none',
	commandFunction: function (Bot, by, args, client) {
		Bot.pm(by, 'Go for ' + data.unitedex.random().name);
	}
};
