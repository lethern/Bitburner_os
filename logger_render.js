import { OS_EVENT } from '/os/event_listener.js'
import { WindowWidget } from '/os/window_widget.js'

/** @typedef {{write: function(string, string, any[]):void, showWindow: function}} LoggerRender */

/** @implements { LoggerRender} */
export class DebugConsoleRender {
	/** @param {import('/os/os.js').OS} os */
	constructor(os) {
		this.#os = os;
		this.#logs = [];
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
			this.#injectCSS();
			this.#renderWindow();
		}
		this.#logs.forEach(log => this.#renderLog(log));
		this.#windowWidget.show();
		this.#visible = true;
	}


	// private

	#renderLog(log) {
		if (!this.#rendered) return;

		let text = '[' + log.severity.toUpperCase() + '] ' + (log.className ? log.className + ': ' : '') + log.text;

		let elem = this.#doc.createElement('div');
		elem.textContent = text

		let css = this.#severityToCss(log.severity);
		if (css) { elem.classList.add(css); }

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

	#injectCSS() {
		this.#os.gui.injectCSS(console_render_css);
	}

	#renderWindow() {
		this.#windowWidget = new WindowWidget(this, this.#os);
		this.#windowWidget.init()
		this.#windowWidget.getContentDiv().classList.add('debugWindow')
		this.#windowWidget.getContentDiv().classList.add('whiteScrollbar')
		this.#rendered = true;
	}

	#on_exit() {
	}

	#os
	#rendered = false
	#visible = false
	#logs
	#logsMax = 150
	#doc
	#windowWidget
}


const console_render_css =
	`
.debugWindow{
	display: block;
	overflow-y: scroll;
	height: 400px;
	width: 600px;
}
.consoleDebug{
	color: #828282;
}
.consoleInfo{
	color: #252525;
}
.consoleWarn{
	color: #9e6c12;
}
.consoleError{
	color: #ec3131;
}
`;
