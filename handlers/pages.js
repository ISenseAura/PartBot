/* eslint-disable max-len */

module.exports = function pageHandler (user, title) {
	if (title.startsWith('unite')) {
		const param = toID(title.substr(5));
		const unite = 'pokemonunite';
		const html = param ? Bot.commandHandler('dt', user, [param], unite, true) : '';
		Bot.say(unite, `/sendhtmlpage ${user}, Unite, ${html ? '<br/><br/><br/><br/><hr/>' : ''}${html}<br/><hr/><br/><br/><br/><br/>${data.unitedex.map(m => {
			return `<button style="border:1px solid #888;padding:5px;background-color:rgba(120,120,120,0.12)" name="send" value="/j view-bot-${toID(Bot.status.nickName)}-unite${toID(m.name)}"><img src="https://d275t8dp8rxb42.cloudfront.net/pokemon/portrait/${m.name}.png" height="50" width="50" style="float:left;margin-top:10px" title="${m.name}"/></button>`;
		}).join('')}<br/><br/>${data.uniteitems.battle.map(i => {
			return `<button style="border:1px solid #888;padding:5px;background-color:rgba(120,120,120,0.12)" name="send" value="/j view-bot-${toID(Bot.status.nickName)}-unite${toID(i.name)}"><img src="https://d275t8dp8rxb42.cloudfront.net/items/battle/${i.name.replace(/ /g, '+')}.png" height="50" width="50" style="float:left;margin-top:10px" title="${i.name}"/></button>`;
		}).join('')}<br/><br/>${data.uniteitems.held.map(i => {
			return `<button style="border:1px solid #888;padding:5px;background-color:rgba(120,120,120,0.12)" name="send" value="/j view-bot-${toID(Bot.status.nickName)}-unite${toID(i.name)}"><img src="https://d275t8dp8rxb42.cloudfront.net/items/held/${i.name.replace(/ /g, '+')}.png" height="50" width="50" style="float:left;margin-top:10px" title="${i.name}"/></button>`;
		}).join('')}`);
	}
};
