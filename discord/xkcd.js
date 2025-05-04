module.exports = {
	help: `Displays a random (or specified) xkcd.`,
	pm: true,
	commandFunction: function (args, message, Bot) {
		const id = toID(args.join(''));
		if (id) {
			axios.get(id === '0' ? 'https://xkcd.com/info.0.json' : `https://xkcd.com/${id}/info.0.json`)
				.then(res => message.channel.send(`${res.data.safe_title} [#${res.data.num ?? id}]`).then(() => message.channel.send(res.data.img)))
				.catch(() => message.channel.send(`That doesn't seem to look like a valid number for an xkcd comic...`));
		} else {
			axios.get('https://c.xkcd.com/random/comic/')
				.then(res => axios.get(res.request.res.responseUrl + 'info.0.json'))
				.then(res => {
					message.channel.send(`${res.data.safe_title} [#${res.data.num}]`);
					message.channel.send(res.data.img);
				})
				.catch(err => Bot.log(err) || message.channel.send(`Umm something went wrong whoops`));
		}
	}
};
