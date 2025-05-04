module.exports = {
	help: `Puzzle Weekend, testing`,
	guildOnly: '816252178104320011',
	commandFunction: function (args, message, Bot) {
		// if (message.channel.id !== '816335589732778065') {
		// 	return message.channel.send('This cannot be used here.').then(msg => msg.delete({ timeout: 3000 }));
		// }

		// LMB code after this
		function rotate(char, val) {
			return String.fromCharCode((char.charCodeAt(0) - 65 + val) % 26 + 65);
		}

		function bug(str) {
			if (str.length > 0) str = str.slice(0, str.length - 1);
			if (str.length > 2) str = str.slice(str.length - 2, str.length) + str.slice(0, str.length - 2);
			return str;
		}

		function dark(str) {
			if (str.length >= 5) str = str.slice(0, 4) + 'I' + str.slice(5, str.length);
			if (str.length >= 6) str = str.slice(0, 5) + 'T' + str.slice(6, str.length);
			return str;
		}

		function dragon(str) {
			return str.split('').reverse().join('');
		}

		function electric(str) {
			if (str.length >= 7) str = str.slice(0, 5) + 'F' + str.slice(7, str.length);
			if (str.length >= 3) str = str.slice(0, 2) + str.slice(3, str.length);
			return str;
		}

		function fairy(str) {
			if (str.length >= 2) {
				str = rotate(str.charAt(str.length - 2), 1) + str + str.charAt(str.length - 1) + str.charAt(str.length - 2);
			}
			return str;
		}

		function fighting(str) {
			if (str.length <= 4) {
				str = str.split('').reverse().join('');
			} else {
				str = str.substring(4, str.length) + str.slice(0, 4).split('').reverse().join('');
			}
			if (str.length >= 1) str = rotate(str.charAt(0), 13) + str;
			return str;
		}

		function fire(str) {
			let arr = str.split('');
			for (let i = 0; i < arr.length; i++) {
				if ('AEIOU'.indexOf(arr[i]) != -1) {
					arr[i] = 'AEIOUA'['AEIOU'.indexOf(arr[i]) + 1];
					break;
				}
			}
			str = arr.join('');
			if (str.length > 5) str = str.slice(0, 4) + str.slice(5, str.length) + str.charAt(4);
			return str;
		}

		function flying(str) {
			return str + str;
		}

		function ghost(str) {
			if (str.length >= 3) str = str.slice(0, 2) + rotate(str.charAt(2), 10) + rotate(str.charAt(2), 1) + str.slice(3, str.length);
			return str;
		}

		function grass(str) {
			if (str.length >= 1) {
				str = str.slice(0, ~~((str.length - 1)/ 2)) + str.slice(~~(str.length / 2) + 1, str.length);
			}
			if (str.length >= 2) {
				str = str.charAt(str.length - 1) + str.slice(1, str.length - 1) + str.charAt(0);
			}
			return str;
		}

		function ground(str) {
			if (str.length >= 4) {
				let temp = str.slice(0, 3);
				str = str.slice(0, str.length - 3) + temp;
			}
			return str;
		}

		function ice(str) {
			if (str.length >= 1) str = str.slice(1, str.length);
			return str;
		}

		function normal(str) {
			str = str.slice(0, ~~((str.length + 1) / 2));
			return str + 'T';
		}

		function poison(str) {
			let arr = str.split('');
			for (let i = 0; i < arr.length; i++) {
				arr[i] = String.fromCharCode(155 - arr[i].charCodeAt(0));
			}
			return arr.join('');
		}

		function psychic(str) {
			if (str.length >= 1) {
				str = 'QWERTYUIOPQASDFGHJKLAZXCVBNMZ'['QWERTYUIOPQASDFGHJKLAZXCVBNMZ'.indexOf(str.charAt(0)) + 1] + str.slice(1, str.length);
			}
			if (str.length >= 4) str = str.slice(0, str.length - 4) + str.charAt(str.length - 1) + str.slice(str.length - 3, str.length);
			return str;
		}

		function rock(str) {
			let arr = str.split('');
			let newstr = ''; 
			for (let i = 0; i < arr.length; i++) {
				if (i % 3 == 0) continue;
				newstr += arr[i];
			}
			return newstr + 'N';
		}

		function steel(str) {
			if (str.length <= 3) str = '';
			else str = str.slice(3, str.length);
			let arr = str.split('');
			for (let i = 0; i < arr.length; i += 2) {
				arr[i] = arr[0];
			}
			return arr.join('');
		}

		function water(str) {
			return str.split('').sort().join('');
		}

		const m = {
			'Bug': bug,
			'Dark': dark,
			'Dragon': dragon,
			'Electric': electric,
			'Fairy': fairy,
			'Fighting': fighting,
			'Fire': fire,
			'Flying': flying,
			'Ghost': ghost,
			'Grass': grass,
			'Ground': ground,
			'Ice': ice,
			'Normal': normal,
			'Poison': poison,
			'Psychic': psychic,
			'Rock': rock,
			'Steel': steel,
			'Water': water
		};

		const [p1, p2, p3] = args.join('').split(',').map(toID);
		if (!p1 || !p2 || p3 || !data.pokedex.hasOwnProperty(p1) || !data.pokedex.hasOwnProperty(p2)) {
			return message.channel.send('Please enter exactly two Pokémon names separated by a comma');
		}

		let name = p2.toUpperCase();
		for (let type of data.pokedex[p1].types) name = m[type](name);
		if (false && data.pokedex[toID(name)]) {
			require('./dt.js').commandFunction([name], message, Bot);
		} else message.channel.send('Output: ' + name);
	}
};
