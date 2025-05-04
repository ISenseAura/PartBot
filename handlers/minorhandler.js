module.exports = {
	initialize: () => {
		Bot.DB = require('origindb')('data/DATA');
		// UGOCODE
		/*
		const tempDB = require('origindb')('data/TEMP');
		Bot.UGO = tempDB('ugo');
		Bot.UGO.save = tempDB.save;
		*/
		// ENDUGOCODE
		Bot.userAppeared = function (user) {
			user = toID(user);
			const mails = Bot.DB('mails').get(user);
			if (!Bot.lmp) Bot.lmp = {};
			if (!mails || !mails.length) return;
			if (Bot.lmp[user] === mails.length) return;
			Bot.lmp[user] = mails.length;
			// eslint-disable-next-line max-len
			Bot.pm(user, `You have ${mails.length} unread mail${mails.length === 1 ? '' : 's'} (from ${tools.listify([...new Set(mails.map(mail => mail.author))])})! Use \`\`${prefix}readmail\`\` to view ${mails.length === 1 ? 'it' : 'them'}!`);
		};
		Bot.teams = require('../data/DATA/teams.json');
		Bot.hotpatch = require('../data/hotpatch.js');
		Bot.watcher = require('./watcher.js')();
		if (!Bot.seenBattles) Bot.seenBattles = new Set();
		Bot.commandHandler = require('./commands.js');
		GAMES.init();
	},
	chaterror: (room, message, isIntro) => {
		// eslint-disable-next-line max-len
		if (message.match(/^The user .*? is offline\.$/) || message === 'You do not have permission to use PM HTML to users who are not in this room.') return;
		if (!isIntro) console.log('ERROR: ' + room + '> ' + message);
		try {
			client.channels.cache.get('719087165241425981').send('ERROR: ' + room + '> ' + message);
		} catch {}
	},
	popup: (message) => console.log('POPUP: ' + message),
	tour: (room, data) => {
		require('./tours.js')(room, data, Bot);
	},
	join: (by, room, time) => {
		Bot.userAppeared(by);
		if (!Bot.jpcool[room]) Bot.jpcool[room] = {};
		if (!Bot.jps[room] || !Bot.jps[room][by]) return;
		if (Bot.jpcool[room][by] && (Bot.jpcool[room][by][0] < 10 || time - Bot.jpcool[room][by][1] < 3600000)) return;
		Bot.say(room, Bot.jps[room][by]);
		Bot.jpcool[room][by] = [0, time];
		return;
	},
	nick: (by, old, room, time) => {
		if (by === old) return;
		DATABASE.see(old, new Date(time));
		Bot.userAppeared(by);
		DATABASE.alt(old, by);
	},
	leave: (by, room, time) => {
		DATABASE.see(by, new Date(time));
		return;
	},
	raw: (room, data, isIntro) => {
		if (isIntro) return;
	},
	pmsuccess: (to, message) => {  },
	updatechallenges: data => {
		try {
			data = JSON.parse(data).challengesFrom;
			for (const key in data) {
				if (data[key] === 'gen8ou') {
					if (!Bot.teams.gen8ou.length) {
						Bot.pm(key, "Sorry, I don't have a team for OU.");
						continue;
					}
					Bot.say('', '/utm ' + Bot.teams.gen8ou.random());
					Bot.say('', '/accept ' + key);
					Bot.log(`Fighting ${key}.`);
					return;
				} else Bot.pm(key, "Sorry, I only play [Gen 8] OU.");
			}
		} catch (e) {
			Bot.log(e);
			Bot.log(data);
		}
	},
	queryresponse: info => {
		info = info.split('|');
		const type = info.shift();
		if (type === 'roomlist') {
			if (!Bot.rooms['2v2']) return;
			try {
				const rooms = JSON.parse(info.join('|')).rooms;
				const batts = Object.keys(rooms);
				batts.forEach(batt => {
					if (Bot.seenBattles.has(batt)) return;
					const battle = rooms[batt];
					if (!battle.minElo || battle.minElo === 'tour') return; // don't report direct challenges / tour battles
					const prefix = Bot.rooms['2v2']._ladderPrefix, floor = Bot.rooms['2v2']._ladderFloor;
					if (floor && battle.minElo < floor) return; // Rating floor
					if (prefix && !toID(battle.p1).startsWith(prefix) && !toID(battle.p2).startsWith(prefix)) return; // Ladder prefix
					Bot.seenBattles.add(batt);
					// eslint-disable-next-line max-len
					Bot.say('2v2', `/addhtmlbox <span class="username">${tools.colourize(battle.p1)}</span> vs <span class="username">${tools.colourize(battle.p2)}</span>: «<a href="/${batt}" style="margin-top:25px;">${batt}</a>» (${battle.minElo})`);
				});
			} catch (e) {
				Bot.log(e);
			}
		} else if (type === 'roominfo') {
			try {
				const room = JSON.parse(info.join('|'));
				if (!Bot.rooms[room.id]) return;
				if (room.id.startsWith('view-bot-')) return; // don't parse stuff from HTML rooms
				Bot.rooms[room.id].type = room.visibility;
				Bot.rooms[room.id].rank = room.users.find(u => toID(u) === toID(Bot.status.nickName))?.[0];
			} catch (e) {
				Bot.log(e);
				Bot.log(info);
			}
		}
	},
	uhtml: (room, label, html, isIntro) => {
		if (isIntro) return;
		if (label === 'mafia' && room === 'galligallisimsim') {
			if (/A game of Mafia was created/.test(html)) {
				Bot.say('hindi', '/wall <<galligallisimsim>> mei ek Mafia ka game shuru hua hai!');
			}
		}
	},
	line: (room, message, isIntro) => {
		if (message.charAt(0) === '>' || isIntro) return;
		if (!Bot.streams[room]) return;
		const stream = Bot.streams[room];
		stream.write(`\n${message}`);
	}
};
