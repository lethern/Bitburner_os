import { DOM_CONSTANTS, icons } from '/os/constants.js'
import { EventListener, OS_EVENT, WindowWidget_EVENT } from '/os/event_listener.js'
import { WindowWidget } from '/os/window_widget.js'
import { Debug } from '/os/debug.js'

export class ServersExplorer {
	/** @param {import('/os/os.js').OS} os */
	constructor(os) {
		this.os = os;
		this.winRenderer = new ServersExplorerRenderer(os, this);

		this.currentServer = 'Home'; // current rendered server
		this.currentDir = '';
		this.isRendered = false;

		this.os.listen(OS_EVENT.INIT, this.init.bind(this));
		this.winRenderer.listen(WindowWidget_EVENT.SHOW, this.onRenderVisible.bind(this));
		this.os.listen(OS_EVENT.ON_EXIT, this.on_exit.bind(this));
	}

	init() {
		this.injectFileExplorerButton();
	}

	injectFileExplorerButton() {
		let fileExplorer_newPath = '<path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z">'

		this.os.gui.injectButton({
			btnLabel: 'Network Explorer',
			btnId: DOM_CONSTANTS.fileExplorerBtnId,
			callback: () => this.winRenderer.windowVisibilityToggle(),
			btnIconPath: fileExplorer_newPath,
			btnIconViewBox: 'viewBox="0 2 18 17"',
		});
	}

	onRenderVisible() {
		// runs only one time
		if (this.isRendered) return;
		this.isRendered = true;
		this.render()
	}

	render() {
		this.winRenderer.renderServers();
	}

	svConnect(svName) {
		let command = 'run /os/plugins/servers_exploer/connect.js'
		this.os.terminal.inputToTerminal(`${command}` + svName);
		this.winRenderer.hide();
	}

	on_exit() {
	}
}

class ServersExplorerRenderer extends EventListener {
	/** @param {import('/os/os.js').OS} os, @param {ServersExplorer} serversExplorer */
	constructor(os, serversExplorer) {
		super();
		this.os = os;
		this.debug = os.debug;
		this.serversExplorer = serversExplorer;

		this.terminal_visible = false;
		this.windowWidget = new WindowWidget(this, os, DOM_CONSTANTS.myCustomWindowId);

		this.os.listen(OS_EVENT.ON_EXIT, this.on_exit.bind(this));
		this.os.listen(OS_EVENT.INIT, this.init.bind(this));
	}

	/** @return {String} */
	get title() {
		return `Network Explorer`
	}

	async renderServers() {
		this.windowWidget.setTitle(this.title)
		let windowDiv = this.windowWidget.getContainer()
		// Update file list
		const fileList = windowDiv.querySelector('.file-list')

		let result = [];
		let visited = { 'home': 0 };
		let queue = Object.keys(visited);
		let name;
		let svObj = (name = 'home', depth = 0) => ({ name: name, depth: depth });
		var scanRes;
		var svNames = [];
		while ((name = queue.pop())) {
			svNames.push(name);
			let depth = visited[name];
			result.push(svObj(name, depth));
			scanRes = await this.os.getNS((ns) => {
				return ns.scan(name)
			});
			for (let i = scanRes.length; i >= 0; i--) {
				if (visited[scanRes[i]] === undefined) {
					queue.push(scanRes[i]);
					visited[scanRes[i]] = depth + 1;
				}
			}
		}

		fileList.innerHTML = svNames.map((elem) => this.#renderIcon(elem, 'networkPC', 'doorOpen', 'check')).join('');
		// Add icon event listeners
		Array.from(windowDiv.querySelectorAll('.file-list__button')).forEach((button) => {
			button.addEventListener('dblclick', this.svConnectOnClick.bind(this))
		});
		Array.from(windowDiv.querySelectorAll('.file-list__backdoor')).forEach((button) => {
			button.addEventListener('dblclick', this.svBackdoorOnClick.bind(this))
		});
		Array.from(windowDiv.querySelectorAll('.file-list__status')).forEach((button) => {
			button.addEventListener('dblclick', this.svHackOnClick.bind(this))
		});
	}

	#renderIcon(name, type, svhacked, svbackdoored) {
		return `
			<li class="file-list__item">
			<center>
			<table>
			<tr>
				<td><button class="file-list__backdoor" data-file-name="${name}">
					${icons[svbackdoored]}
				</button></td>
				<td><button class="file-list__status" data-file-name="${name}">
					${icons[svhacked]}
				</button></td>
				</tr>
				</table>
				</center>
				<button class="file-list__button" data-file-name="${name}" data-file-type="${type}">
					${icons[type]}
					<span class="file-list__label">${name}</span>
				</button>
			</li>
		`
	}

	svConnectOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const fileName = button.dataset.fileName

		this.serversExplorer.svConnect(fileName)
	}
	svBackdoorOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const fileName = button.dataset.fileName

		this.serversExplorer.svConnect(fileName)
	}
	svHackOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const fileName = button.dataset.fileName

		this.serversExplorer.svConnect(fileName)
	}

	init() {
		this.windowWidget.init();
		this.windowWidget.getContentDiv().innerHTML = '<ul class="file-list file-list--layout-icon-row" />';
		this.windowWidget.addMenuItem({ label: 'Debug', callback: this.onDebugMenuClick.bind(this) })
		this.windowWidget.addMenuItem({ label: 'Test', callback: this.onTestMenuClick.bind(this) })
		//this.listenForTerminalHidden();
	}

	hide() {
		this.windowWidget.hide();
	}

	onDebugMenuClick() {
		this.os.debug.print("MENU OPEN", Debug.DEBUG_LEVEL);
		this.os.debug.console.showWindow()
	}

	onTestMenuClick() {
		this.os.debug.print("test dbg", Debug.DEBUG_LEVEL);
		this.os.debug.print("test info", Debug.INFO_LEVEL);
		this.os.debug.print("test warn", Debug.WARN_LEVEL);
		this.os.debug.print("test error", Debug.ERROR_LEVEL);
	}

	windowVisibilityToggle() {
		this.windowWidget.windowVisibilityToggle();
	}

	onWindowClose() {
		this.os.closeAndExit();
	}

	on_exit() {
		Object.keys(this).forEach(key => this[key] = null);
	}
}