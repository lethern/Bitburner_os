
export class Debug{
	constructor(){
		this.cache = {};
		this.console = new DebugConsoleRender();

		this.debugLevels = Object.keys(Debug).map(p => Debug[p]);
	}
	
	print(...args){
		console.log(...args);

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
	constructor() {
		this.rendered = false;
		this.visible = false;
		this.logs = [];
		this.logsMax = 150;
		this.doc = globalThis['document'];

		this.debugLevels = Object.keys(Debug).map(p => Debug[p]);
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
		let css = this.severityToCss(log.severity);
		if(css) elem.classList.add(css);

		this.windowDiv.appendChild(elem);
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
		this.windowDiv = this.doccreateElement('div');
		this.windowDiv.innerHTML = ``;
		this.rendered = true;
		this.logs.forEach(log => this.renderLog(log));
	}

	showWindow() {

	}
}