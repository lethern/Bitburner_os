
export class Log {
	static DEBUG_LEVEL = 'debug'
	static INFO_LEVEL = 'info'
	static WARN_LEVEL = 'warn'
	static ERROR_LEVEL = 'error'
}

export class Logger {
	/**
	 * @param {object} parent
	 * @param {import('/os/logger_render.js').LoggerRender} logRenderer
	 */
	constructor(parent, logRenderer) {
		this.#parentName = (parent.constructor ? parent.constructor.name : '' + parent);
		this.#console = logRenderer;
	}

	debug(...args) {
		this.#console.write(Log.DEBUG_LEVEL, this.#parentName, args);
	}

	info(...args) {
		this.#console.write(Log.INFO_LEVEL, this.#parentName, args);
	}

	warn(...args) {
		this.#console.write(Log.WARN_LEVEL, this.#parentName, args);
	}

	error(...args) {
		this.#console.write(Log.ERROR_LEVEL, this.#parentName, args);
	}

	/** @param {string} severity @param {...any} args */
	print(severity, ...args) {
		if (!Logger.#debugLevels.includes(severity)) {
			args.unshift(severity);
			severity = 'info';
		}
		this.#console.write(severity, this.#parentName, args);
	}

	#console
	#parentName

	static #debugLevels = Object.values(Log)
}
