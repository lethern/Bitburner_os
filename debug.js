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
			args.shift();
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

	write(text, severity) {
		let log = this.storeLog(text, severity);
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

	renderWindow() {
		if (this.rendered) return;

		this.windowWidget = new WindowWidget(this);
		this.windowWidget.init()
		this.windowWidget.windowVisibility(true);
		//this.windowDiv = this.doc.createElement('div');
		//this.windowDiv.innerHTML = ``;
		this.rendered = true;
		this.visible = true;
		this.logs.forEach(log => this.renderLog(log));
	}

	on_exit() {
		if (!this.rendered) return;
		this.windowWidget.dispose()
		this.rendered = false;
	}

	windowVisibility(visible) {
		// called by windowWidget, but no need to do anything
	}
}
