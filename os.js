import { DebugConsoleRender, Logger } from '/os/logger.js'
import { EventListener, OS_EVENT } from '/os/event_listener.js'
import { FilesExplorer } from '/os/files_explorer.js'
import { GUI } from '/os/gui.js'
import { Utils } from '/os/utils.js'
import { Terminal } from '/os/terminal.js'
import { ServersManager } from '/os/servers_manager.js'
import { ServersExplorer } from '/os/plugins/servers_explorer/servers_explorer.js'

export class OS extends EventListener {

	constructor(ns) {
		super();

		this.initNSInternals(ns);

		this.#NSqueue = [];
		this.#doLoop = true;

		this.logRenderer = new DebugConsoleRender(this);
		this.#log = new Logger(this, this.logRenderer);
		this.eventListener_initLog(this.#log);
		this.filesExplorer = new FilesExplorer(this);
		this.gui = new GUI(this);
		this.terminal = new Terminal();
		this.serversManager = new ServersManager(this);
		this.serversExplorer = new ServersExplorer(this);
	}

	/** @param {NS} ns */
	initNSInternals(ns) {
		// this is the only function that has direct access to NS object,
		// its *carefuly* used in runNSQueue

		let _hasAccessToNS = false;

		this.#internal_NS = function () {
			if (_hasAccessToNS)
				return ns;
			else {
				return null;
			}
		};
		this.run = async function () {
			this.fire(OS_EVENT.INIT);

			const delay = 50
			while (this.#doLoop) {
				_hasAccessToNS = true;

				this.fire(OS_EVENT.LOOP_STEP);
				await this.#runNSQueue();

				_hasAccessToNS = false;
				await ns.sleep(delay);
			}
		}
	}

	/** @param {(NS) => void} func @returns Promise */
	getNS(func) {
		let def = new Utils.Deferred();
		this.#NSqueue.push({ func, def })
		return def.promise;
	}

	/** @param {(NS) => void} func */
	getNS_noPromise(func) {
		this.#NSqueue.push({ func })
	}

	closeAndExit() {
		this.getNS_noPromise(ns => ns.exit());
	}


	// private fields, methods

	#doLoop
	#internal_NS
	#NSqueue
	#log

	async #runNSQueue() {
		let stopwatch = 0;
		let ns = this.#internal_NS();
		while (this.#NSqueue.length) {
			let q = this.#NSqueue;
			this.#NSqueue = [];

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

	on_exit() {
		this.#log.debug("on_exit");
		this.#doLoop = false;
		this.fire(OS_EVENT.ON_EXIT);
	}
}
