import { OS_EVENT } from '/os/event_listener.js'
import { WindowWidget } from '/os/window_widget.js'

export class Log {
	static DEBUG_LEVEL = 'debug'
	static INFO_LEVEL = 'info'
	static WARN_LEVEL = 'warn'
	static ERROR_LEVEL = 'error'
}

export class Logger {
	/**
	 * @param {object} parent
	 * @param {LoggerRender} logRenderer
	 */
	constructor(parent, logRenderer) {
		this.#parentName = (parent.constructor ? parent.constructor.name : '' + parent);
		this.#cache = {};
		this.#console = logRenderer;

		this.#debugLevels = Object.values(Log)
	}

	/** @param {...any} args */
	debug(...args) {
		this.#console.write(Log.DEBUG_LEVEL, this.#parentName, args);
	}

	/** @param {...any} args */
	info(...args) {
		this.#console.write(Log.INFO_LEVEL, this.#parentName, args);
	}

	/** @param {...any} args */
	warn(...args) {
		this.#console.write(Log.WARN_LEVEL, this.#parentName, args);
	}

	/** @param {...any} args */
	error(...args) {
		this.#console.write(Log.ERROR_LEVEL, this.#parentName, args);
	}

	/** @param {string} severity @param {...any} args */
	print(severity, ...args) {
		if (!this.#debugLevels.includes(severity)) {
			args.unshift(severity);
			severity = 'info';
		}
		this.#console.write(severity, this.#parentName, arguments.callee.caller.name, args);
	}

	printOnce(...args) {
		let json = JSON.stringify(args);
		if (this.#cache[json]) return;
		this.#cache[json] = 1;
		this.print(...args);
	}

	showWindow() {
		this.#console.showWindow()
	}

	#cache
	#console
	#debugLevels
	#parentName
}


/** @typedef {{write: function(string, string, any[]):void, showWindow: function, onWindowClose: function}} LoggerRender */

/** @implements { LoggerRender} */
export class DebugConsoleRender {
	/** @param {import('/os/os.js').OS} os */
	constructor(os) {
		this.#os = os;
		this.#rendered = false;
		this.#visible = false;
		this.#logs = [];
		this.#logsMax = 150;
		this.#doc = globalThis['document'];

		this.#os.listen(OS_EVENT.ON_EXIT, this.#on_exit.bind(this));
	}

	write(severity, className, args) {
		let log = this.#storeLog(severity, className, '' + args);
		if (!this.#visible) {
			return;
		}
		this.#renderLog(log);
	}

	showWindow() {
		if (!this.#rendered) {
			this.#renderWindow();
		}
		this.#logs.forEach(log => this.#renderLog(log));
		this.#windowWidget.show();
		this.#visible = true;
	}

	onWindowClose() {
		// called by windowWidget
		this.#visible = false;
	}

	// private

	#renderLog(log) {
		if (!this.#rendered) return;

		let text = '[' + log.severity.toUpperCase() + '] ' + (log.className ? log.className + ': ' : '') + log.text;

		let elem = this.#doc.createElement('div');
		elem.textContent = text

		let css = this.#severityToCss(log.severity);
		if(css){ elem.classList.add(css);}

		this.#windowWidget.getContentDiv().appendChild(elem);
	}

	#storeLog(severity, className, text) {
		this.#logs.push({ severity, text, className, dom: null });
		if (this.#logs.length > this.#logsMax) {
			this.#removeSomeLogs();
		}
		return this.#logs[this.#logs.length - 1];
	}

	#removeSomeLogs() {
		let removed = this.#logs.splice(0, 20);
		removed.forEach(log => {
			if (log.dom && log.dom.parentNode) {
				log.dom.parentNode.removeChild(log.dom);
			}
		});
	}

	#severityToCss(severity) {
		switch (severity) {
			case 'debug': return 'consoleDebug';
			case 'info': return 'consoleInfo';
			case 'warn': return 'consoleWarn';
			case 'error': return 'consoleError';
			default: return null;
		}
	}

	#renderWindow() {
		this.#windowWidget = new WindowWidget(this, this.#os);
		this.#windowWidget.init()
		this.#windowWidget.getContentDiv().classList.add('debugWindow')
		this.#windowWidget.getContentDiv().classList.add('whiteScrollbar')
		this.#rendered = true;
	}

	#on_exit() {
		this.#rendered = false;
		this.#visible = false;
	}

	#os
	#rendered
	#visible
	#logs
	#logsMax
	#doc
	#windowWidget
}
