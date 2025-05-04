module.exports = function eventRegister (Bot) {

	// Battles

	Bot.registerEvent('uno-win', (room, user) => {
		if (['redacted'].includes(room)) {
			Bot.say(room, `Congratulations to ${user} for winning the game of Uno!`);
			tools.addPoints(0, { [user]: 10 }, room, '_Uno');
		}
	});
};
