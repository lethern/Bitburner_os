import { WindowWidget } from '/os/window_widget.js'
import { Logger } from '/os/logger.js'
import { ServersManager } from '/os/servers_manager.js'
import { Utils } from '/os/utils.js'
import { GUI } from '/os/gui.js';

/**
 * @typedef {Object} API_Object
 * @property {OS_API} os
 * @property {ClassesAPI} classes
 * @property {Utils} utils
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
 * @property { (callback: (ns: NS) => Promise<any> | any) => Promise} getNS
 * @property { (callback: (ns: NS) => void) => void} getNS_noPromise
 * @property { () => ServersManager} getServersManager
 * @property { () => GUI} getGUI
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
			let utils = { ...Utils };
			Object.freeze(utils)

			this.#apiObject = {
				os: this.#getOS_API(),
				classes: this.#getClassesAPI(),
				utils: utils,

				exit: () => this.#exit(),
			};
		}
		return this.#apiObject;
	}

	#getOS_API() {
		return {
			getNS: async (func) => {
				if (!this.#active) return;
				//this.#log.debug("API.getNS for " + this.#pluginName);
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

			/** @returns {GUI} */
			getGUI: () => {
				return this.#os.gui;
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
