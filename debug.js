import { OS_EVENT } from '/os/event_listener.js'
import { WindowWidget } from '/os/window_widget.js'

export class Debug{
	/** @param {import('/os/os.js').OS} os */
	constructor(os){
		this.cache = {};
		this.os = os;
		this.console = new DebugConsoleRender(this);

		this.debugLevels = Object.keys(Debug).map(p => Debug[p]);
	}
	
	print(...args){
		let severity = 'info';
		let last = args[args.length - 1];
		if (this.debugLevels.includes(last)) {
			severity = last;
			args.pop();
		}
		this.console.write(severity, args);
	}

	printOnce(...args){
		let json = JSON.stringify(args);
		if(this.cache[json])return;
		this.cache[json] = 1;
		this.print(...args);
	}
}

Object.defineProperties(Debug, {
	DEBUG_LEVEL: { value: 'debug', enumerable: true },
	INFO_LEVEL: { value: 'info', enumerable: true },
	WARN_LEVEL: { value: 'warn', enumerable: true },
	ERROR_LEVEL: { value: 'error', enumerable: true },
});


class DebugConsoleRender {
	/** @param {Debug} owner */
	constructor(owner) {
		this.owner = owner;
		this.rendered = false;
		this.visible = false;
		this.logs = [];
		this.logsMax = 150;
		this.doc = globalThis['document'];

		this.debugLevels = Object.keys(Debug).map(p => Debug[p]);
		this.owner.os.listen(OS_EVENT.ON_EXIT, this.on_exit.bind(this));
	}

	severityToString = function (s) {
		return `[${('' + s).toUpperCase()}]`;
	}

	write(severity, args) {
		let log = this.storeLog(''+args, severity);
		if (!this.visible) {
			return;
		}
		this.renderLog(log);
	}

	storeLog(text, severity) {
		this.logs.push({ severity, text, dom: null });
		if (this.logs.length > this.logsMax) {
			this.removeSomeLogs();
		}
		return this.logs[this.logs.length - 1];
	}

	removeSomeLogs() {
		let removed = this.logs.splice(0, 20);
		removed.forEach(log => {
			if (log.dom && log.dom.parentNode) {
				log.dom.parentNode.removeChild(log.dom);
			}
		});
	}

	renderLog(log) {
		if (!this.rendered) return;

		let text = this.severityToString(log.severity) + ' ' + log.text;
		let elem = this.doc.createElement('div');
		elem.textContent = text
		let css = this.severityToCss(log.severity);
		console.log(log.severity, css)
		if(css){ elem.classList.add(css);}
		console.log(text)
		this.windowWidget.getContentDiv().appendChild(elem);
	}

	severityToCss(severity) {
		switch (severity) {
			case 'debug': return 'consoleDebug';
			case 'info': return 'consoleInfo';
			case 'warn': return 'consoleWarn';
			case 'error': return 'consoleError';
			default: return null;
		}
	}

	showWindow() {
		if (!this.rendered) {
			this.renderWindow();
		}
		this.logs.forEach(log => this.renderLog(log));
		this.windowWidget.show();
		this.visible = true;
	}

	renderWindow() {
		this.windowWidget = new WindowWidget(this, this.owner.os);
		this.windowWidget.init()
		this.windowWidget.getContentDiv().style.display = 'block'
		this.windowWidget.getContentDiv().style.overflow = 'scroll'
		this.rendered = true;
	}

	on_exit() {
		this.rendered = false;
		this.visible = false;
	}

	onWindowClose() {
		// called by windowWidget
		this.visible = false;
	}
}