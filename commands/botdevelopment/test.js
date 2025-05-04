module.exports = {
	cooldown: 0,
	help: `Testing stuff.`,
	permissions: 'coder',
	commandFunction: function (Bot, room, time, by, args, client, redir = false) {
		return Bot.say(room, 'TestA');
		const pkmn = toID(args.join('')) || 'zacian';
		const mon = data.unitedex.find(m => toID(m.name) === pkmn);
		const lv = 15;
		const stats = data.unitestats.find(m => m.name === mon.name).level[lv - 1];
		const hst = { ...data.unitestats[0].level[lv - 1] };
		data.unitestats.forEach(stat => {
			Object.entries(stat.level[lv - 1]).forEach(([k, v]) => {
				if (hst[k] < v) hst[k] = v;
			});
		});
		nunjucks.render('unite/character.njk', { mon, lv, hst, stats, redir }, (e, html) => {
			if (e) console.log(e);
			else Bot.say(room, `!htmlbox ${html}`);
		});
	}
};
