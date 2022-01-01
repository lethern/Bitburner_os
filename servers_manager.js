import { OS_EVENT, EventListener, ServersManager_EVENT } from '/os/event_listener.js'
import { Logger } from '/os/logger.js'

/**
 * @typedef {{parent: string, neighbors: string[]}} ServerObject
 */

export class ServersManager extends EventListener {

	/** @param {import('/os/os.js').OS} os */
	constructor(os) {
		super();
		this.#os = os;

		this.#log = new Logger(this, os.logRenderer);
		this.eventListener_initLog(this.#log);

		//this.#server = this.#getCurrentServer()
		this.#lastWatchTime = Date.now();

		this.#os.listen(OS_EVENT.INIT, () => this.#init());
		this.#os.listen(OS_EVENT.LOOP_STEP, () => this.#run());

		this.#getCurrentConnectedServer();
	}

	/** @return {String} */
	get connectedServer() {
		return this.#server
	}

	#init() {
		this.#fetchAllServersFull()
	}

	/** @return {ServerObject[]} */
	get serversArray() {
		return this.#serversArray ? [...this.#serversArray] : []
	}

	/** @returns {Object.<string, ServerObject>} */
	get serversObj() {
		if (!this.#serversObj) return {};

		let copy = { ...this.#serversObj };
		Object.freeze(copy);
		Object.values(copy).forEach(obj => obj.neighbors = [...obj.neighbors]);
		return copy;
	}

	get serversObjFull() {
		if (!this.#serversObjFull) {
			this.#fetchAllServersFull()
			return [];
		}

		let copy = [...this.#serversObjFull ];
		Object.freeze(copy);
		return copy;
	}
	
	
	// private fields, methods

	#os
	#log
	#server = 'home'
	#serversArray // array of name
	#serversObj   // map<name, {parent: string, neighbors: string[]}>
	#serversObjFull // map<name, NS::Server>
	#lastWatchTime

	#run() {
		const watchDelay = 2000;

		let diff = Date.now() - this.#lastWatchTime;
		if (diff < 0) { this.#lastWatchTime = Date.now() } // OS error

		if (diff > watchDelay) {
			this.#lastWatchTime = Date.now();
			this.#serverWatch()

			this.#fetchAllServersFull()
		}
	}

	async #getCurrentConnectedServer() {
		if (!this.#serversObj) await this.#fetchAllServers()

		let connectedServer = await this.#os.getNS(ns => {
			for (const name of this.#serversArray) {
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
			this.fire(ServersManager_EVENT.CONNECTED_SERV_CHANGED)
		}
	}

	async #fetchAllServers() {
		await this.#os.getNS(ns => {
			let serversObj = { "home": { parent: null } };
			let serversArray = [];

			let scanned = {};
			let stack = ["home"];

			while (stack.length) {
				let target = stack.pop();

				if (scanned[target]) continue;

				let neighbors = ns.scan(target);
				serversObj[target].neighbors = neighbors;
				serversArray.push(target);
				scanned[target] = 1;

				stack.push(...neighbors);
				
				neighbors.forEach(serv => {
					if (!serversObj[serv]) {
						serversObj[serv] = { parent: target };
					}
				})
			}
			this.#serversObj = serversObj;
			this.#serversArray = serversArray;
		});
	}

	async #fetchAllServersFull() {
		if (!this.#serversArray) await this.#fetchAllServers();

		this.#serversObjFull = await this.#os.getNS(ns => {
			return this.#serversArray
				.filter(ns.serverExists)
				.map(ns.getServer)
		});
	}
}