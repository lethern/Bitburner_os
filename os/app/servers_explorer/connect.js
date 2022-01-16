/** @param {NS} ns **/
export async function main(ns) {
	let target = ns.args[0];
	let paths = { "home": "" };
	let queue = Object.keys(paths);
	let name;
	let output;
	let pathToTarget = [];
	while ((name = queue.shift())) {
		let path = paths[name];
		let scanRes = ns.scan(name);
		for (let newSv of scanRes) {
			if (paths[newSv] === undefined) {
				queue.push(newSv);
				paths[newSv] = `${path},${newSv}`;
				if (newSv == target)
					pathToTarget = paths[newSv].substr(1).split(",");

			}
		}
	}
	output = "home; ";

	pathToTarget.forEach(server=> output += " connect " + server + ";");

	const terminalInput = globalThis['document'].getElementById("terminal-input");
	terminalInput.value=output;
	const handler = Object.keys(terminalInput)[1];
	terminalInput[handler].onChange({target:terminalInput});
	terminalInput[handler].onKeyDown({keyCode:13,preventDefault:()=>null});
}

export function autocomplete(data, args) {
	return [...data.servers];
}