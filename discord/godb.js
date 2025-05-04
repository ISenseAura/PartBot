const sheetsParser = require('sheets-parser');

module.exports = {
	help: `Updates the GO databases!`,
	guildOnly: '292873182677958657',
	commandFunction: function (args, message, Bot) {
		if (message.channel.id !== '859528623446294538') return message.channel.send('_softly flexes_');
		const client = sheetsParser();
		client.getDataFromSheet('1cSm11AfVmMrRIAxDzzCc_G7mFjtIYY0rXRRweZEyEyo', ['#pokedex', '#fast_moves', '#charged_moves']).then(db => ({
			pokedex: db.pokedex,
			moves: {
				fast: db.fast_moves,
				charged: db.charged_moves
			}
		})).then(db => {
		return fsp.writeFile('./data/DATA/go.json', JSON.stringify(db, null, '\t'));
		}).then(() => {
			require('../data/hotpatch.js')('go', message.author.username);
		}).then(() => {
			message.channel.send('It... worked? Damn nice');
		}).catch(err => {
			Bot.log(err);
			message.channel.send(`Uh-oh it crashed\nSince y'all are nerds anyways...\n${err.message}\n\n${err.stack}`);
		});
		// return;
		// (() => {
		// 	function generateParser (rawHeaders) {
		// 		const headers = rawHeaders[0].map((header, i) => [header, rawHeaders[1][i]]);
		// 		function dataFromRow (row) {
		// 			const obj = {};
		// 			const typeMap = {
		// 				Boolean: input => ['n', 'no', 'false', '0', '-', ''].includes(input.toLowerCase()) ? false : true,
		// 				Integer: input => parseInt(input) || 0,
		// 				Number: input => Number(input) || 0,
		// 				String: input => String(input)
		// 			};
		// 			function getType (type) {
		// 				const validTypes = ['Boolean', 'String', 'Number'];
		// 				if (typeMap.hasOwnProperty(type)) return typeMap[type];
		// 				const arrType = Object.keys(typeMap).find(vType => type.startsWith(`<${vType}>`));
		// 				if (arrType) return [typeMap[arrType], type.substr(arrType.length + 2) || ','];
		// 				return false;
		// 			}
		// 			headers.forEach(([label, rawType], index) => {
		// 				// parse label
		// 				const hierarchy = label.split('.');
		// 				let parent = obj;
		// 				let key = hierarchy[hierarchy.length - 1];
		// 				for (let i = 0; i < hierarchy.length - 1; i++) {
		// 					const hierarKey = hierarchy[i].replace(/\?$/, '');
		// 					if (!parent.hasOwnProperty(hierarKey)) parent[hierarKey] = {};
		// 					if (typeof parent[hierarKey] !== 'object') throw new Error(`Path ${hierarchy.slice(0, i + 1).join('.')} already exists as ${parent[hierarchy[i]]}`);
		// 					parent = parent[hierarKey];
		// 				}
		// 				const isArray = key.endsWith('[]');
		// 				if (isArray) key = key.slice(0, -2);
		// 				const isOptional = key.endsWith('?');
		// 				if (isOptional) key = key.slice(0, -1);
		// 				if (parent.hasOwnProperty(key)) throw new Error(`Error parsing ${label}: Property '${key}' already exists on object as ${parent[key]}`);
		// 				// parse value
		// 				const type = getType(rawType);
		// 				if (!type) throw new Error(`Unrecognized type ${rawType}`);
		// 				if (Array.isArray(type)) {
		// 					if (!isArray) throw new Error(`Header conflict (label indicates array while typedef does not)`);
		// 					const val = (row[index] === '' ? [] : row[index].split(type[1])).map(type[0]);
		// 					if (!isOptional || val.length) parent[key] = val;
		// 				} else {
		// 					if (isArray) throw new Error(`Header conflict (label does not indicate array while typedef does)`);
		// 					const val = type(row[index]);
		// 					if (!isOptional || val) parent[key] = val;
		// 				}
		// 				// Trim optional nests
		// 				for (let i = hierarchy.length - 2; i >= 0; i--) {
		// 					const subArchy = hierarchy.slice(0, i + 1).map(path => ({ path: path.replace(/\?$/, ''), optional: path.endsWith('?') }));
		// 					let lastChild = obj, secondLastChild;
		// 					for (const path of subArchy) [secondLastChild, lastChild] = [lastChild, lastChild[path.path]];
		// 					if (Object.keys(lastChild).length === 0) delete secondLastChild[subArchy[subArchy.length - 1].path];
		// 				}
		// 			});
		// 			return obj;
		// 		}
		// 		return dataFromRow;
		// 	}

		// 	const { sheets } = require('@googleapis/sheets');
		// 	const Sheets = sheets({
		// 		version: 'v4',
		// 		auth: process.env.GOOGLE_API_KEY
		// 	});

		// 	return Sheets.spreadsheets.values.batchGet({
		// 		spreadsheetId: '1cSm11AfVmMrRIAxDzzCc_G7mFjtIYY0rXRRweZEyEyo',
		// 		ranges: ['#pokedex', '#fast_moves', '#charged_moves']
		// 	}).then(res => {
		// 		const loaded = res.data.valueRanges.map(sheet => sheet.values);
		// 		const dex = {}, fast = {}, charged = {};
		// 		const stores = [dex, fast, charged];
		// 		loaded.forEach((sheet, i) => {
		// 			const parser = generateParser(sheet.splice(0, 2));
		// 			const data = sheet.map(parser);
		// 			const store = stores[i];
		// 			data.forEach(mon => store[toID(mon.name)] = mon);
		// 		});
		// 		const out = { pokedex: dex, moves: { fast, charged } };
		// 		return fs.promises.writeFile('./data/DATA/go.json', JSON.stringify(out, null, '\t'))
		// 			.then(() => require('../data/hotpatch.js')('go', message.author.username));
		// 	});
		// })().then(() => {
		// 	message.channel.send('It... worked? Damn nice');
		// }).catch(err => {
		// 	Bot.log(err);
		// 	message.channel.send(`Uh-oh it crashed\nSince y'all are nerds anyways...\n${err.message}\n\n${err.stack}`);
		// });
	}
};
