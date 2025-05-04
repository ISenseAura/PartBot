/* eslint-disable no-unreachable */

module.exports = {
	cooldown: 1,
	help: `HPL schedule`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client) {
		return Bot.roomReply(room, by, `Disabled.`);
		try {
			const cur = new Date(new Date().toLocaleString('GMT', { timeZone: 'Asia/Kolkata' })).getTime();
			delete require.cache[require.resolve('../../data/DATA/scheduled.json')];
			const { teamValues, schedule } = require('../../data/DATA/scheduled.json');
			const sorter = (a, b) => {
				if (a.time < cur) a.time += 7 * 24 * 60 * 60 * 1000;
				if (b.time < cur) b.time += 7 * 24 * 60 * 60 * 1000;
				return a.time - b.time;
			};
			if (!schedule.length) return Bot.roomReply(room, by, 'There are no scheduled matches.');
			// eslint-disable-next-line max-len
			const html = `<hr/><center style="max-height:270px;overflow-y:scroll;"><table style="border:1px;border-style:collapse;">${schedule.sort(sorter).slice(0, 25).map(match => `<tr style="height:36px;"><td style="font-size:0.8em;">${match.match.replace(/\s*\([^)]*\)\s*/g, '')}</td><td style="text-align:center;width:180px;">${tools.colourize(match.players[0])}</td><td style="width:36px;background-color:${teamValues[toID(match.teams[0])].color};text-align:center;"><img src="${teamValues[toID(match.teams[0])].logo}" height="30" width="30" style="vertical-align:middle;"/></td><td style="width:36px;background-color:${teamValues[toID(match.teams[1])].color};text-align:center;"><img src="${teamValues[toID(match.teams[1])].logo}" height="30" width="30" style="vertical-align:middle;"/></td><td style="text-align:center;width:180px;">${tools.colourize(match.players[1])}</td><td>${match.schedule}</td></tr>`).join('')}</table></center><hr/>`;
			if (tools.hasPermission(by, 'gamma', room)) Bot.say(room, `/adduhtml HPLSCHEDULE, ${html}`);
			else Bot.sendHTML(by, html);
		} catch (e) {
			if (tools.hasPermission(by, 'gamma', room)) Bot.say(room, `Abhi to koi scheduled nahi hai.`);
			else Bot.pm(by, `Abhi to koi scheduled nahi hai.`);
		}
	}
};
