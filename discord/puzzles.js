const PZ = require('../data/PUZZLES/index.js');

module.exports = {
	help: `Displays all puzzles.`,
	guildOnly: PZ.guildID,
	commandFunction: function (args, message, Bot) {
		// if (message.channel.id !== '1132314541984849930') return message.channel.send('PartMan sucks');
		if (!PZ.live && message.channel.id !== PZ.IDs.staffChannel) {
			return message.channel.send("Sorry, this command may not be used at this time. 'o.o");
		}
		const team = PZ.getTeam(message.channel.id);
		if (!team && ![/* PZ.finishChannel, */PZ.IDs.staffChannel].includes(message.channel.id)) {
			return message.channel.send("Can't be used here.");
		}
		if (team && !team.unsolved.length) args = [true];
		const Discord = require('discord.js'), embed = new Discord.MessageEmbed();
		const puzzles = team ? args.length ? team.unlocked : team.unsolved : require('../data/PUZZLES/puzzles.json');
		embed.setColor('#2ECC71');
		embed.setTitle(`Puzzles`).addFields(puzzles.map(p => PZ.getPuzzle(p)).map(puzzle => {
			return {
				name: `${puzzle.index}. ${puzzle.title}`,
				value: puzzle.url
			};
		}));
		message.channel.send(embed);
	}
};
