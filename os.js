import { Debug } from '/os/debug.js'
import { EventListener, OS_EVENT } from '/os/event_listener.js'
import { FilesExplorer } from '/os/files_explorer.js'
import { GUI } from '/os/gui.js'
import { Utils } from '/os/utils.js'
import { Terminal } from '/os/terminal.js'

export class OS extends EventListener {
	#server
	#serverList
	#serverWatchInterval = 0

	constructor(ns) {
		super();

		this.initNSInternals(ns);

		this.NSqueue = [];
		/** @type {Debug} */
		this.debug = new Debug();
		this.FilesExplorer = new FilesExplorer(this);
		this.gui = new GUI(this);
		this.terminal = new Terminal(this);

		this.doLoop = true;

		this.#cacheServers(ns)
		this.#server = this.#getCurrentServer(ns)
	}

	/** @return {String} */
	get server() {
		return this.#server
	}

	initNSInternals(ns) {
		let _hasAccessToNS = false;

		this.internal_NS = function () {
			if (_hasAccessToNS)
				return ns;
			else {
				return null;
			}
		};
		this.run = async function () {
			this.fire(OS_EVENT.INIT);

			const delay = 50
			while (this.doLoop) {
				_hasAccessToNS = true;

				this.#serverWatchInterval += delay
				if (this.#serverWatchInterval >= 1000) {
					this.#serverWatchInterval = 0
					this.#serverWatch(ns)
				}

				await this.runNSQueue();

				_hasAccessToNS = false;
				await ns.sleep(delay);
			}
		}
	}

	/** @param {(NS) => void} func @returns Promise */
	getNS(func) {
		let def = new Utils.Deferred();
		this.NSqueue.push({ func, def })
		return def.promise;
	}

	/** @param {(NS) => void} func */
	getNS_noPromise(func) {
		this.NSqueue.push({ func })
	}

	async runNSQueue() {
		let stopwatch = 0;
		let ns = this.internal_NS();
		while (this.NSqueue.length) {
			let q = this.NSqueue;
			this.NSqueue = [];

			if (++stopwatch > 10) {
				q.forEach(({ def }) => { def && def.reject('stopwatch (there is too big recursion in getNS calls)'); })
				break;
			}

			q.forEach(({ func, def }) => {
				let res = func(ns);
				if (res instanceof Promise)
					def && def.reject('Cannot use async callback with getNS');
				else
					def && def.resolve(res);
			});
		}
	}

	/**
	 * @param {NS} ns
	 * @return {String}
	 */
	#getCurrentServer(ns) {
		for (const server of this.#serverList) {
			if (ns.getServer(server).isConnectedTo) {
				return server
			}
		}

		return ns.getHostname()
	}

	#cacheServers(ns) {
		this.#serverList = new Set([ns.getHostname()])

		for (let server of this.#serverList) {
			ns.scan(server).forEach((result) => this.#serverList.add(result))
		}
	}

	#serverWatch(ns) {
		const currentServer = this.#getCurrentServer(ns)
		console.log('current = ', currentServer, '; old = ', this.server)
		if (currentServer !== this.server) {
			this.#server = currentServer
			this.FilesExplorer.render()
		}
	}

	on_exit() {
		this.debug.print("OS on_exit", Debug.DEBUG_LEVEL);
		this.doLoop = false;
		this.fire(OS_EVENT.ON_EXIT);
	}
}
