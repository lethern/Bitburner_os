import { OS_EVENT } from '/os/event_listener.js'

export class ServersManager {
	#server
	#serverList

	/** @param {import('/os/os.js').OS} os */
	constructor(os) {
		this.os = os;
		//this.#cacheServers()
		this.#server = 'home'
		//this.#server = this.#getCurrentServer()
		this.lastWatchTime = Date.now();

		this.os.listen(OS_EVENT.LOOP_STEP, this.run.bind(this));

		this.#getCurrentConnectedServer();
	}

	/** @return {String} */
	get connectedServer() {
		return this.#server
	}

	run() {
		const watchDelay = 1000;

		let diff = Date.now() - this.lastWatchTime;
		if (diff < 0) { this.lastWatchTime = Date.now() } // OS error

		if (diff > watchDelay) {
			this.lastWatchTime = Date.now();
			this.#serverWatch()
		}
	}

	async #getCurrentConnectedServer() {
		if (!this.#serverList) await this.#fetchServerList()

		let connectedServer = await this.os.getNS(ns => {
			for (const server of this.#serverList) {
				if (ns.getServer(server).isConnectedTo) {
					return server.getHostname()
				}
			}
		})

		this.#server = connectedServer
		return connectedServer
	}

	async #fetchServerList() {
		this.#serverList = new Set()
		this.#serverList.add('home')

		await this.os.getNS(ns => {
			for (let server of this.#serverList) {
				ns.scan(server).forEach((result) => this.#serverList.add(result))
			}
		});
	}

	async #serverWatch() {
		const currentServer = await this.#getCurrentConnectedServer()

		if (currentServer !== this.connectedServer) {
			this.#server = currentServer
			this.os.filesExplorer.render()
		}
	}

	async fetchAllServers() {
		return await this.os.getNS(ns => {
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