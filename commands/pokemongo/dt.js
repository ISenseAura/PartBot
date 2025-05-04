module.exports = {
	help: `Shows the info of a Pokemon.`,
	permissions: 'none',
	commandFunction: function (Bot, room, time, by, args, client, isPM) {
		if (!args.length) return Bot.roomReply(room, by, unxa);
		const monID = toID(args.join(''));
		const final = tools.queryGO(monID);
		if (!final) return Bot.roomReply(room, by, `No matches found.`);
		let html;
		switch (final.type) {
			case 'pokemon': {
				const mon = final.info;
				const L40_CP = tools.getCP(mon.name, 40), L50_CP = tools.getCP(mon.name, 50), L51_CP = tools.getCP(mon.name, 51);
				const stats = mon.baseStats;
				// eslint-disable-next-line max-len
				html = `<div class="message"><ul class="utilichart"><li class="result"><span class="col numcol">${mon.unreleased ? 'UR' : 'GO'}</span> <span class="col iconcol"><psicon pokemon="${toID(mon.name)}"/></span> <span class="col pokemonnamecol" style="white-space:nowrap"><a href="https://dex.pokemonshowdown.com/pokemon/${toID(mon.name)}" target="_blank">${mon.name}</a></span> <span class="col typecol">${mon.types.map(type => `<img src="https://play.pokemonshowdown.com/sprites/types/${type}.png" alt="${type}" height="14" width="32">`).join('')}</span> <span style="float:left;min-height:26px"><span class="col statcol"><em>Atk</em><br/>${stats.atk}</span> <span class="col statcol"><em>Def</em><br/>${stats.def}</span> <span class="col statcol"><em>Sta</em><br/>${stats.sta}</span> <span class="col bstcol" style="margin-left:10px;"><em>40</em><br/>${L40_CP}</span> <span class="col bstcol" style="margin-left:10px;"><em>50</em><br/>${L50_CP}</span> <span class="col bstcol" style="margin-left:10px;"><em>MCP</em><br/>${L51_CP}</span> </span></li><li style="clear:both"></li></ul></div><font size="1"><font color="#686868">Dex#:</font> ${mon.num}&nbsp;|&ThickSpace;<font color="#686868">Gen:</font> ${[0, 152, 252, 387, 495, 650, 722, 810, 906, 1011].findIndex(num => mon.num < num)}&nbsp;|&ThickSpace;<font color="#686868">Height:</font> ${mon.heightm} m&nbsp;|&ThickSpace;<font color="#686868">Weight:</font> ${mon.weightkg} kg${mon.shiny ? '&nbsp;|&ThickSpace; ✓ Can be shiny' : ''}${mon.shinyLocked ? '&nbsp;|&ThickSpace;Shiny-locked' : ''}&nbsp;|&ThickSpace;<font color="#686868">Evolution:</font> ${mon.evos?.join(', ') || 'None'}</font><br/><hr/><details style="margin-bottom:-10px"><summary${mon.unreleased ? ' title="Moves are for an unreleased Pokémon and may not be accurate"' : ''}>Moves${mon.unreleased ? '*' : ''}</summary>Fast: ${[...mon.moves.fast, ...mon.moves.fast_elite.map(move => `${move}*`)].sort().join(', ')}<br/>Charged: ${[...mon.moves.charged, ...mon.moves.charged_elite.map(move => `${move}*`)].sort().join(', ')}</details>`;
				break;
			}
			case 'charged_move': {
				const move = final.info;
				// eslint-disable-next-line max-len
				html = `<ul class="utilichart" style="margin-bottom:-10px"><li class="result"><span class="col movenamecol">&nbsp;<a href="https://gamepress.gg/pokemongo/pokemon-move/${move.name.replace(/ /g, '-').toLowerCase()}">${move.name}</a></span><span class="col typecol"><img src="//play.pokemonshowdown.com/sprites/types/${move.type}.png" alt="${move.type}" width="32" height="14"><img src="//play.pokemonshowdown.com/sprites/categories/Physical.png" alt="Charged" width="32" height="14"></span></li><li class="result"><span class="col widelabelcol" style="margin-top:10px;color:#999">PvP</span><span class="col widelabelcol"><em>Energy</em><br/>${move.pvp.energy}</span><span class="col widelabelcol"><em>Power</em><br/>${move.pvp.power}</span><span class="col labelcol"><em>DPE</em><br/>${move.pvp.dpe}</span><span class="col movedesccol">&nbsp;&nbsp;${move.desc}</span></li><li class="result"><span class="col widelabelcol" style="margin-top:10px;color:#999">PvE</span><span class="col widelabelcol"><em>Energy</em><br/>${move.pve.energy}</span><span class="col widelabelcol"><em>Power</em><br/>${move.pve.power}</span><span class="col labelcol"><em>Time</em><br/>${move.pve.duration}s</span><span class="col labelcol"><em>DPE</em><br/>${move.pve.dpe}</span><span class="col widelabelcol"><em>D<sup>2</sup>/ES</em><br/>${move.pve.d2pes}</span><span class="col widelabelcol"><em>Delay</em><br/>${move.pve.delay}s</span></li></ul>
`;
				break;
			}
			case 'fast_move': {
				const move = final.info;
				// eslint-disable-next-line max-len
				html = `<ul class="utilichart" style="margin-bottom:-10px"><li class="result"><span class="col movenamecol">&nbsp;<a href="https://gamepress.gg/pokemongo/pokemon-move/${move.name.replace(/ /g, '-').toLowerCase()}">${move.name}</a></span><span class="col typecol"><img src="//play.pokemonshowdown.com/sprites/types/${move.type}.png" alt="${move.type}" width="32" height="14"><img src="//play.pokemonshowdown.com/sprites/categories/Special.png" alt="Fast" width="32" height="14"></span></li><li class="result"><span class="col widelabelcol" style="margin-top:10px;color:#999">PvP</span><span class="col widelabelcol"><em>Energy</em><br/>${move.pvp.energy}</span><span class="col widelabelcol"><em>Power</em><br/>${move.pvp.power}</span><span class="col labelcol"><em>Turns</em><br/>${move.pvp.turns}</span><span class="col labelcol"><em>EPS</em><br/>${move.pvp.eps}</span><span class="col labelcol"><em>DPS</em><br/>${move.pvp.dps}</span></li><li class="result"><span class="col widelabelcol" style="margin-top:10px;color:#999">PvE</span><span class="col widelabelcol"><em>Energy</em><br/>${move.pve.energy}</span><span class="col widelabelcol"><em>Power</em><br/>${move.pve.power}</span><span class="col labelcol"><em>Time</em><br/>${move.pve.duration}s</span><span class="col widelabelcol"><em>EPS</em><br/>${move.pve.eps}</span><span class="col widelabelcol"><em>DPS</em><br/>${move.pve.dps}</span><span class="col widelabelcol"><em>Delay</em><br/>${move.pve.delay}s</span></li></ul>`;
				break;
			}
		}

		if (isPM) Bot.sendHTML(by, html);
		else if (tools.hasPermission(by, 'gamma', room)) Bot.say(room, `/addhtmlbox ${html}`);
		else {
			Bot.say(room, `/sendprivatehtmlbox ${by}, ${html}`);
			Bot.roomReply(room, by, 'Hi, I\'d recommend using this command in my DMs instead - that way the other people in chat don\'t have to see your messages!');
		}
	}
};
