
export function getServers(ns){
	let serversFound = new Set();
	let stack = [];
	stack.push('home');

	while(stack.length > 0) {
		let server = stack.pop();
		if (!serversFound.has(server)){
			serversFound.add(server);
			let neighbors = ns.scan(server);
			for (let serv of neighbors) {
				if (!serversFound.has(serv))
					stack.push(serv);
			}
		}
	}
	return Array.from(serversFound);
}