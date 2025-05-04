const axios = require('axios');
const fs = require('fs').promises;

const data = { pokedex: require('./pokedex.json') };


exports.fetchEntries = async () => {
	function getID (name) {
		return name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
	}
	function toID (name) {
		return name.toLowerCase().replace(/[^a-z0-9]/g, '');
	}
	const fetchedEntries = Object.fromEntries(Object.values(data.pokedex).filter(m => m.num > 0).map(m => [toID(m.name), false]));
	const fullList = Object.values(data.pokedex).filter(m => m.num > 0).filter(m => !m.forme).map(m => [m.name, getID(m.name)]);
	const batches = fullList.reduce((a, b, i) => (i % 10 ? a[~~(i / 10)].push(b) : a[i / 10] = [b], a), []);
	for (const [index, batch] of batches.entries()) {
		console.log(new RegExp(`${index.toString().padStart(3, ' ')} of ${batches.length}`));
		await Promise.all(batch.map(async ([name, mon]) => {
			try {
				const { data } = await axios.get(`https://pokemondb.net/pokedex/${mon}#dex-flavor`);
				const entryHTML = data.match(/<h2>Pokédex entries<\/h2>.*?<\/table><\/div>\n/s).toString();
				const formes = entryHTML.includes('<h3>') ? entryHTML.match(/<h3>.*?<\/table>/gs) : [entryHTML];
				const formeData = formes.map(forme => {
					const formeName = forme.match(/(?<=<h3>).*?(?=<\/h3>)/)?.toString() || name;
					const entries = Object.fromEntries(forme.match(/<tr>.*?<\/tr>/gs).map(entry => {
						const games = entry.match(/(?<=<span class="igame [^ ]+">).*?(?=<\/span>)/gs);
						const text = entry.match(/(?<=<td class="cell-med-text">).*?(?=<\/td>)/s);
						return [games, text.toString()];
					}).map(([games, entry]) => games.map(game => [game, entry])).flat());
					return { formeName, entries };
				});
				console.log(`Done with`, formeData.map(m => m.formeName));
				fetchedEntries[toID(mon)] = Object.fromEntries(formeData.map(set => [set.formeName, set.entries]));
				await fs.writeFile('./data/DATA/entries.json', JSON.stringify(fetchedEntries, null, '\t'));
			} catch (e) {
				console.log(mon, e);
			}
		}));
	}
};

exports.fetchEntries().then(console.log);
