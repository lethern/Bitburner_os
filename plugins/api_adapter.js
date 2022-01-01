import { WindowWidget } from '/os/window_widget.js'
import { Logger } from '/os/logger.js'
import { ServersManager } from '../servers_manager';

/**
 * @typedef {Object} API_Object
 * @property {OS_API} os
 * @property {ClassesAPI} classes
 * @property {function(): void} exit
 */


/**
 * @typedef {Object} ClassesAPI
 * @property { (parent: any) => WindowWidget } newWindowWidget
 */

/**
 * @typedef {Object} NS
 * */
/**
 * @typedef {Object} OS_API
 * @property { (callback: (ns: NS) => Promise) => Promise} getNS
 * @property { (callback: (ns: NS) => void) => void} getNS_noPromise
 * @property { () => ServersManager} getServersManager
 */

export class API_Adapter {
	/** @param {import('/os/os.js').OS} os @param {string} pluginName */
	constructor(os, pluginName) {
		this.#os = os;
		this.#log = new Logger(this, os.logRenderer);
		this.#pluginName = pluginName
	}

	getAPI_Object() {
		if (!this.#apiObject) {
			this.#apiObject = {
				os: this.#getOS_API(),
				classes: this.#getClassesAPI(),

				exit: () => this.#exit(),
			};
		}
		return this.#apiObject;
	}

	#getOS_API() {
		return {
			getNS: async (func) => {
				if (!this.#active) return;
				this.#log.debug("API.getNS for " + this.#pluginName);
				return this.#os.getNS(func);
			},

			/** @param {(NS) => void} func */
			getNS_noPromise: (func) => {
				if (!this.#active) return;
				this.#os.getNS_noPromise(func)
			},

			/** @returns {ServersManager} */
			getServersManager: () => {
				return this.#os.serversManager
			},
		}
	}

	#getClassesAPI() {
		return {
			newWindowWidget: (parent) => {
				if (!this.#active) return;
				let winWidget = new WindowWidget(parent, this.#os);
				this.#createdWindows.push(winWidget)
				return winWidget;
			}
		}
	}

	#exit() {
		this.#createdWindows.forEach(win => {
			win.on_exit();
		})

		this.#active = false;
	}

	#os
	#log
	#pluginName
	/** @type {WindowWidget[]} */
	#createdWindows = []
	#active = true

	#apiObject

}
