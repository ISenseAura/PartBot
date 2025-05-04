module.exports = {
	help: `Scrapes a given Smogon thread replays of the given format. If a format is not specified, scrapes  for all. DO NOT OVERUSE.`,
	permissions: 'none',
	commandFunction: function (Bot, by, args, client) {
		const key = "smogscrapeactive";
		if (Bot[key]) return Bot.pm(by, "In use; please try again in 30 seconds.");
		if (!args.length) return Bot.pm(by, unxa);
		const message = args.join(' ');
		const threadLink = message.match(/https?:\/\/www.smogon.com\/forums\/threads\/[a-z0-9-]+\.\d+\b/);
		const format = message.match(/\bgen[1-8][a-z0-9]+\b/i);
		if (!threadLink) return Bot.pm(by, "Unable to detect a valid Smogon thread.");
		Bot.replayRegex = format ?
			new RegExp(`(?:re)?play\\.pokemonshowdown\\.com\\/((?:smogtours-)?${toID(format[0])}-\\d+(?:-[a-z0-9]+pw)?)`, 'g') :
			/(?:re)?play\.pokemonshowdown\.com\/((?:smogtours-)?gen[1-8][a-z0-9]+-\d+(?:-[a-z0-9]+pw)?)/g;
		const mapF = rep => "" + rep.match(/[^/]+$/);
		Bot[key] = { replays: [], pages: 0, pageNum: 0, threadLink: threadLink[0] };
		Bot.pm(by, "Initiating scraper...");
		new Promise((resolve, reject) => {
			axios.get(Bot[key].threadLink).then(res => {
				const matches = res.data.match(Bot.replayRegex);
				if (matches) Bot[key].replays.push(...matches.map(mapF));
				Bot[key].pages = res.data.match(/<li class="pageNav-page "><a href="\/[^"]+\/page-(\d+)">\1<\/a><\/li>/);
				if (!Bot[key].pages) {
					return resolve();
				} else Bot[key].pages = Bot[key].pages[1];
				Bot[key].pages = [parseInt(Bot[key.pages]), 30].reduce((a, b) => a > b ? a : b, 0);
				function nextPage () {
					Bot[key].pageNum++;
					if (Bot[key].pageNum > Bot[key].pages) return resolve();
					axios.get(`${Bot[key].threadLink}/page-${Bot[key].pageNum}`).then(resN => {
						const matches = resN.data.match(Bot.replayRegex);
						if (matches) Bot[key].replays.push(...matches.map(mapF));
						nextPage();
					});
				}
				nextPage();
			}).catch(e => {
				Bot.pm(by, "Something went wrong: " + e.message);
				Bot.log(e);
				reject();
			});
		}).then(() => {
			Bot[key].replays = [...new Set(Bot[key].replays)];
			// eslint-disable-next-line max-len
			Bot.pm(by, `Done! From ${Bot[key].pages || '1'} page${Bot[key].pages ? 's' : ''}, I got ${Bot[key].replays.length} replays.`);
		}).catch(e => {
			Bot.pm(by, "Sorry, something went wrong. Replays I got were: ");
			Bot.log(e);
		}).finally(() => {
			if (!Bot[key].replays.length) Bot.pm(by, "Oh, I didn't find any. ;-;");
			// eslint-disable-next-line max-len
			else Bot.serve(by, Bot[key].replays.sort().map(rep => `<a href="https://replay.pokemonshowdown.com/${rep}" target="_blank">https://replay.pokemonshowdown.com/${rep}</a>`).join('<br/>'));
			setTimeout(() => delete Bot[key], 0);
		});
	}
};
