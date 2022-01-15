import { Logger } from '/os/logger.js'
import { DebugConsoleRender } from '/os/app/logger_render.js'
import { EventListener, OS_EVENT } from '/os/event_listener.js'
import { FilesExplorer } from '/os/app/files_explorer.js'
import { GUI } from '/os/gui.js'
import { Utils } from '/os/utils.js'
import { Terminal } from '/os/terminal.js'
import { ServersManager } from '/os/servers_manager.js'
import { ServersExplorer } from '/os/app/servers_explorer/servers_explorer.js'
import { PluginsManager } from '/os/plugins/plugins_manager.js'
import { PackagesExplorer } from '/os/app/packages_explorer.js'

export class OS extends EventListener {

	constructor(ns) {
		super();

		this.#initNSInternals(ns);

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
		this.packagesExplorer = new PackagesExplorer(this);

		this.plugins = new PluginsManager(this);
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

	/** @param {NS} ns */
	#initNSInternals(ns) {
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

				if (!this.#doLoop) return; // safety check
				await ns.sleep(delay);
			}
		}
	}

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

			for (let { func, def } of q) {
				if (!this.#doLoop) return; // safety check

				try {
					let res = await func(ns);
					def && def.resolve(res);
				} catch (e) {
					this.#log.error("Exception in NS promise", e.message, e.stack);
					def && def.reject(e);
				}
			}
		}
	}

	on_exit() {
		this.#doLoop = false;
		this.#log.debug("on_exit");

		// clear references to make GC life easier with closures
		this.run = null;
		this.#internal_NS = null;
		this.#NSqueue = null;
		Object.keys(this).forEach(key => this[key] = null);

		this.fire(OS_EVENT.ON_EXIT);
	}
}
