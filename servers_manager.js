import { OS_EVENT } from '/os/event_listener.js'

export class ServersManager {

	/** @param {import('/os/os.js').OS} os */
	constructor(os) {
		this.#os = os;
		//this.#cacheServers()
		this.#server = 'home'
		//this.#server = this.#getCurrentServer()
		this.#lastWatchTime = Date.now();

		this.#os.listen(OS_EVENT.LOOP_STEP, this.#run.bind(this));

		this.#getCurrentConnectedServer();
	}

	/** @return {String} */
	get connectedServer() {
		return this.#server
	}

	/** @return {string[]} */
	get allServers(){
		return this.#serverObjList ? [...this.#serverObjList] : []
	}
	
	
	// private fields, methods
	
	#server
	#serverObjList
	#os
	#lastWatchTime

	#run() {
		const watchDelay = 1000;

		let diff = Date.now() - this.#lastWatchTime;
		if (diff < 0) { this.#lastWatchTime = Date.now() } // OS error

		if (diff > watchDelay) {
			this.#lastWatchTime = Date.now();
			this.#serverWatch()
		}
	}

	async #getCurrentConnectedServer() {
		if (!this.#serverObjList) await this.#fetchAllServers()

		let connectedServer = await this.#os.getNS(ns => {
			for (const { name } of this.#serverObjList) {
				if (ns.serverExists(name) && ns.getServer(name).isConnectedTo) {
					return name
				}
			}
		})

		if (!connectedServer) connectedServer = 'home'
		return connectedServer
	}

	async #serverWatch() {
		const currentServer = await this.#getCurrentConnectedServer()

		if (currentServer !== this.connectedServer) {
			this.#server = currentServer
			this.#os.filesExplorer.render()
		}
	}

	async #fetchAllServers() {
		this.#serverObjList = await this.#os.getNS(ns => {
			let found = {};
			let targets = getNewNeighbors(ns, "home", found);
			let servers = [];
			servers.push(...targets);

			while (targets.length) {
				let neighbors_sum = [];
				for (let elem of targets) {
					let newNeighbors = getNewNeighbors(ns, elem.name, found);
					neighbors_sum.push(...newNeighbors);
					servers.push(...newNeighbors);
				}

				targets = neighbors_sum;
			}
			return servers;
		});

		function getNewNeighbors(ns, target, found) {
			let neighbors = ns.scan(target);
			found[target] = 1;

			return neighbors.filter((val) => {
				let exists = found[val];
				found[val] = 1;
				return !exists;
			}).map((elem) => ({ name: elem, parent: target }));
		}
	}
}