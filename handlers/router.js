const path = require('path');

// TODO: Use a proper router for this

module.exports = {
	get: function (req, res) {
		const args = req.url.split('/');
		args.shift();
		if (!args[0]) return res.redirect('/home');
		if (Bot.AFD && Math.random() < 0.3) return res.redirect(`https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be`);
		switch (args[0].toLowerCase()) {
			case 'chat-ai-policy': case 'cv': case 'home': case 'hypnosis': case 'tic-tac-toe': {
				fs.readFile(`./pages/${args[0]}.html`, 'utf8', (err, file) => {
					if (err) {
						Bot.log(err);
						return res.send('Something went wrong! PartMan has been informed.');
					}
					return res.send(file);
				});
				break;
			}
			case 'aifa': {
				if (!args[1]) return res.send(`Which mode? Try <a href="${websiteLink}/aifa/heuristic">this</a>.`);
				switch (toID(args.slice(1).join(''))) {
					case 'heuristic': return res.sendFile(path.join(__dirname, '..', 'pages', 'aifa_h.html'));
					case 'simple': return res.sendFile(path.join(__dirname, '..', 'pages', 'aifa_s.html'));
					default: return res.send(`?`);
				}
			}
			case 'connectfour': {
				if (!args[1]) return res.send("Err, it looks like you forgot to specify the game code, sorry.");
				if (/^(?:[a-z]{2})\d*$/.test(args[1])) return res.send("Invalid game code.");
				fs.readFile('./pages/connectfour.html', 'utf8', (err, file) => {
					if (err) {
						Bot.log(err);
						return res.send('Something went wrong! PartMan has been informed.');
					}
					return res.send(file.replace('##GAME_STR##', args[1]));
				});
				break;
			}
			case 'dexentries': case 'entries': {
				fs.readFile(`./public/dexentries.txt`, 'utf8', (err, file) => {
					if (err) {
						Bot.log(err);
						return res.send('Something went wrong! PartMan has been informed.');
					}
					Bot.log(file.length);
					return res.send(file);
				});
				break;
			}
			case 'hpi': {
				return res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
			}
			case 'hpl': {
				fs.readFile(`./pages/${req.url}.html`, 'utf8', (err, file) => {
					if (err) return res.send("Maaf karna, requested URL mila nahi.");
					return res.send(file);
				});
				break;
			}
			case 'koala': {
				return res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
			}
			case 'othello': {
				if (!args[1]) return res.send("Err, it looks like you forgot to specify the game code, sorry.");
				if (/[^A-Za-z0-9_-]/.test(args[1])) return res.send("Invalid game code.");
				fs.readFile('./pages/othello.html', 'utf8', (err, file) => {
					if (err) {
						Bot.log(err);
						return res.send('Something went wrong! PartMan has been informed.');
					}
					return res.send(file.replace('##GAME_STR##', args[1]));
				});
				break;
			}
			case 'puzzles': case 'puzzle': case 'ugo': {
				if (!args[1]) return res.send("Sorry, you'll need to specify the name of the puzzle you want to see!");
				let sudo = false, name = args[1];
				if (name.endsWith('supersecretsudo')) {
					name = name.substr(0, name.length - 'supersecretsudo'.length);
					sudo = true;
				}
				const PZ = require('../data/PUZZLES/index.js');
				if (!PZ.live && !sudo) return res.send("It hasn't started yet!");
				name = toID(name);
				if (name === 'constructor') return res.send('Nerd');
				if (name === 'yinyang') return res.redirect(`https://lovemathboy.github.io/`);
				fs.readFile(`./pages/UGO/${name}.pdf`, (err, file) => {
					if (err) return res.send(`Sorry, that wasn't a puzzle! <small>Or was it?</small>`);
					res.contentType("application/pdf");
					res.send(file);
				});
				break;
			}
			case 'qfa': {
				const name = args[1] || 'home';
				if (name === 'constructor') return res.send('Nerd');
				fs.readFile(`./pages/puzzles/${name}.html`, 'utf8', (err, file) => {
					if (err) return res.send(`Sorry, that wasn't a puzzle! <small>Or was it?</small>`);
					res.send(file);
				});
				break;
			}
			case 'quotes': {
				if (!args[1]) return res.send(`Hi, you'll need to specify the room! Simply go to ${websiteLink}/quotes/(room)!`);
				const room = args.slice(1).join('').toLowerCase().replace(/[^a-z0-9-]/g, '');
				fs.readdir(`./data/QUOTES`, (e, files) => {
					if (e) {
						Bot.log(e);
						return res.send(e.message);
					}
					if (!files.includes(`${room}.json`)) return res.send(`Sorry, don't have any quotes in that room!`);
					fs.readFile(`./data/QUOTES/${room}.json`, 'utf8', (err, dt) => {
						if (err) {
							Bot.log(e);
							return res.send(e.message);
						}
						// TODO: Use nunjucks
						fs.readFile(`./pages/quotes.html`, 'utf8', (err, html) => {
							if (err) return res.send(err.message);
							const quoteHtml = JSON.parse(dt).quotes
								.map((q, i) => `<span class="num">${i + 1})</span><div class="quote">${tools.quoteParse(q)}</div>`)
								.join('<hr/>');
							return res.send(html.replace('###QUOTEINFO###', quoteHtml));
						});
					});
				});
				break;
			}
			case 'regexhunt': case 'regexhunts': {
				fs.readFile('./pages/regexhunts.html', 'utf8', (err, file) => {
					if (err) {
						Bot.log(err);
						return res.send('Something went wrong! PartMan has been informed.');
					}
					return res.send(file);
				});
				break;
			}
			case 'user': {
				const user = args[1], key = args[2];
				if (!Bot.keys[user]) return res.send("Sorry, I don't have any pages for that user.");
				if (Bot.keys[user] !== parseInt(key)) return res.send("Sorry, invalid key!");
				const header = `<head><title>PartBot</title><link rel="icon" href="/public/icon.png"></head>`;
				return res.send(`${header}<body>${Bot.pageData[user]}</body>`);
			}
			case 'public': {
				try {
					res.sendFile(path.join(__dirname, '..', ...args));
				} catch (e) {
					// Bot.log(e);
				}
				break;
			}
			default: {
				return res.send("Sorry, couldn't find the page you were looking for!");
			}
		}
	},
	post: function (req, res) {
		const args = req.url.split('/');
		args.shift();
		switch (args[0].toLowerCase()) { 
			default: return res.send("Sorry, couldn't find the page you were looking for!");
		}
	}
};
