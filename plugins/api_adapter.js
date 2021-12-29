import { WindowWidget } from '/os/window_widget.js'
import { Logger } from '/os/logger.js'

export class API_Adapter {
	/** @param {import('/os/os.js').OS} os @param {string} pluginName */
	constructor(os, pluginName) {
		this.#os = os;
		this.#log = new Logger(this, os.logRenderer);
		this.#pluginName = pluginName
	}

	getAPI_Object() {
		return {
			os: this.#getOS_API(),
			classes: this.#getClassesAPI(),
		};
	}

	#getOS_API() {
		return {
			/** @param {(NS) => void} func @returns Promise */
			getNS: async (func) => {
				this.#log.debug("API.getNS for " + this.#pluginName);
				return this.#os.getNS(func);
			},

			/** @param {(NS) => void} func */
			getNS_noPromise: (func) => {
				this.#os.getNS_noPromise(func)
			},
		}
	}

	#getClassesAPI() {
		return {
			/** @param {object} parent @param {import('/os/os.js').OS} os @param {string} [id]  */
			newWindowWidget: (parent) => { return new WindowWidget(parent, this.#os) }
		}
	}

	#os
	#log
	#pluginName

}
