import { getServers } from "servers.js";

async function mainPlugin(api) {
	let os = api.os;
	let classes = api.classes;

	let windowWidget = classes.newWindowWidget(this);
	windowWidget.init();
	windowWidget.getContentDiv().classList.add('greenScrollbar')
	windowWidget.getContentDiv().classList.add('grayBackground')
	windowWidget.setTitle('Pizza')
	windowWidget.show();

	// script logic
	await os.getNS(ns => {
		const servers = getServers(ns).filter(x => ns.getHackingLevel() / 1.5 > ns.getServerRequiredHackingLevel(x));
		const data = [];
		for (const target of servers) {
			const server = ns.getServer(target);
			const difficulty = server.minDifficulty;
			const ht_mul = 2.5 * server.requiredHackingSkill * difficulty + 500;
			const raw = server.moneyMax * server.serverGrowth;
			data.push([target, (raw / ht_mul / 1e7)]);
		}
		data.sort((a, b) => b[1] - a[1]).map((x, i) => { if (i < 5) ns.tprint(`${x[0]} = ${x[1]}`) });
		windowWidget.getContentDiv().textContent = data.join('\n')
		ns.tprint(`Best is ${data.sort((a, b) => b[1] - a[1])[0]}`);
	});
}