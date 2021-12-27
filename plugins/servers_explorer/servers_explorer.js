import { DOM_CONSTANTS, icons } from '/os/constants.js'
import { EventListener, OS_EVENT, WindowWidget_EVENT } from '/os/event_listener.js'
import { WindowWidget } from '/os/window_widget.js'
import { Utils } from '/os/utils.js'
import { Logger } from '/os/logger.js'

// |-----------------------------------------------------------------------|
// |				servers_explorer.js
// |			Created by: TheDroidUrLookingFor
// |
// |	Github: https://github.com/TheDroidYourLookingFor/BitBurner-Scripts
// |
// |      Last Modified by: TheDroidUrLookingFor
// |
// |		Version:	1.0.3
// |
// | Information: Currently you can only connect, backdoor, or NUKE targets.
// |	More features will be added in future versions.
// |
// |-----------------------------------------------------------------------|

export class ServersExplorer {
	/** @param {import('/os/os.js').OS} os */
	constructor(os) {
		this.#os = os;
		this.#winRenderer = new ServersExplorerRenderer(os, this);

		this.#isRendered = false;

		this.#os.listen(OS_EVENT.INIT, this.init.bind(this));
		this.#winRenderer.listen(WindowWidget_EVENT.SHOW, this.onRenderVisible.bind(this));
		this.#os.listen(OS_EVENT.ON_EXIT, this.#on_exit.bind(this));
	}

	init() {
		this.injectFileExplorerButton();
	}

	injectFileExplorerButton() {
		let fileExplorer_newPath = '<path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z">'

		this.#os.gui.addMenuButton({
			btnLabel: 'Network Explorer',
			btnId: DOM_CONSTANTS.fileExplorerBtnId,
			callback: () => this.#winRenderer.windowVisibilityToggle(),
			btnIconPath: fileExplorer_newPath,
			btnIconViewBox: 'viewBox="0 2 18 17"',
		});
	}

	onRenderVisible() {
		if (this.#isRendered) return;
		this.#isRendered = true;
		this.render()
	}

	render() {
		this.#winRenderer.renderServers();
	}

	async svConnect(svName) {
		let command = 'home'
		this.#os.terminal.inputToTerminal(`${command}`);
		await Utils.sleep(250);
		command = 'run /os/plugins/servers_explorer/connect.js'
		this.#os.terminal.inputToTerminal(`${command} ${svName}`);
		this.#winRenderer.hide();
	}

	async svBackdoor(svName) {
		let command = 'home'
		this.#os.terminal.inputToTerminal(`${command}`);
		await Utils.sleep(250);
		command = 'run /os/plugins/servers_explorer/connect.js '
		this.#os.terminal.inputToTerminal(`${command}` + svName);
		await Utils.sleep(250);
		command = 'backdoor'
		this.#os.terminal.inputToTerminal(`${command}`);
		this.#winRenderer.hide();
	}
	async svHack(svName) {
		let command = 'home'
		this.#os.terminal.inputToTerminal(`${command}`);
		await Utils.sleep(250);
		command = 'run /os/plugins/servers_explorer/connect.js '
		this.#os.terminal.inputToTerminal(`${command}` + svName);
		await Utils.sleep(250);
		command = 'run NUKE.exe'
		this.#os.terminal.inputToTerminal(`${command}`);
		this.#winRenderer.hide();
	}

	#on_exit() {
	}

	#os
	#winRenderer
	#isRendered
}

class ServersExplorerRenderer extends EventListener {
	/** @param {import('/os/os.js').OS} os, @param {ServersExplorer} serversExplorer */
	constructor(os, serversExplorer) {
		super();
		this.#os = os;
		this.#log = new Logger(this, os.logRenderer);
		this.eventListener_initLog(this.#log);
		this.#serversExplorer = serversExplorer;

		this.#windowWidget = new WindowWidget(this, os, DOM_CONSTANTS.myCustomWindowId);

		this.#os.listen(OS_EVENT.ON_EXIT, this.on_exit.bind(this));
		this.#os.listen(OS_EVENT.INIT, this.init.bind(this));
	}

	#os
	#log
	#serversExplorer
	#windowWidget


	/** @return {String} */
	get title() {
		return `Network Explorer`
	}

	async renderServers() {
		this.#windowWidget.setTitle(this.title)
		let windowDiv = this.#windowWidget.getContainer()
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
			scanRes = await this.#os.getNS((ns) => {
				return ns.scan(name)
			});
			for (let i = scanRes.length; i >= 0; i--) {
				if (visited[scanRes[i]] === undefined) {
					queue.push(scanRes[i]);
					visited[scanRes[i]] = depth + 1;
				}
			}
		}

		fileList.innerHTML = svNames.map((elem) => this.#renderIcon(elem, 'server', 'check', 'doorOpen', false)).join('');
		Array.from(windowDiv.querySelectorAll('.server-connect__button')).forEach((button) => {
			button.addEventListener('dblclick', this.svConnectOnClick.bind(this))
		});
		Array.from(windowDiv.querySelectorAll('.server-run__backdoor')).forEach((button) => {
			button.addEventListener('dblclick', this.svBackdoorOnClick.bind(this))
		});
		Array.from(windowDiv.querySelectorAll('.server-run__status')).forEach((button) => {
			button.addEventListener('dblclick', this.svHackOnClick.bind(this))
		});
	}


	async rootCheck(svName) {
		var checkRoot = await this.os.getNS((ns) => {
				return ns.hasRootAccess(svName)
			});
		this.#renderIcon(svName, 'server', 'check', 'doorOpen', checkRoot)
	}


	#renderIcon(name, type, svhacked, svbackdoored, hasRoot) {
		let facServers = [
			"CSEC",
			"avmnite-02h",
			"I.I.I.I",
			"run4theh111z",
			"The-Cave",
			"w0r1d_d43m0n"
		];

		var systemColor = "server-connect__button";
		let rootStatus = "server-run__status";
		if (facServers.includes(name)) {
			type = 'firewall'
			if (name == "CSEC" | name == "avmnite-02h" | name == "I.I.I.I" | name == "run4theh111z") systemColor = "server-connect__button_gold";
			if (name == "The-Cave") systemColor = "server-connect__button_orange";
			if (name == "w0r1d_d43m0n") systemColor = "server-connect__button_red";
		}
		if (name == "home") {
			type = 'networkPC'
		}
		if (name == "n00dles") {
			type = 'noodles'
		}
		if (hasRoot) {
			rootStatus = "server-run__status_rooted";
		}

		return `
			<li class="server-list__item">
			<center>
			<table>
			<tr>
						<td>
						<button class="server-run__backdoor" data-file-name="${name}">
					${icons[svbackdoored]}
						</button>
						</td>
						<td>
						<button class="server-run__scripts" data-file-name="${name}">
							${icons['ihack']}
						</button>
						</td>
						<td>
						<button class="${rootStatus}" data-file-name="${name}">
					${icons[svhacked]}
						</button>
						</td>
				</tr>
				</table>
				</center>
			<button class="${systemColor}" data-file-name="${name}" data-file-type="${type}">
					${icons[type]}
				<span class="server-list__label">${name}</span>
				</button>
			</li>
		`
	}

	svConnectOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const fileName = button.dataset.fileName

		this.#serversExplorer.svConnect(fileName)
	}
	svBackdoorOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const fileName = button.dataset.fileName

		this.#serversExplorer.svBackdoor(fileName)

	}
	svHackOnClick(event) {
		let button = event.currentTarget;

		event.stopPropagation()
		const fileName = button.dataset.fileName

		this.#serversExplorer.svHack(fileName)
	}

	init() {
		this.#windowWidget.init();
		this.#windowWidget.getContentDiv().innerHTML = '<ul class="file-list file-list--layout-icon-row" />';
		//this.#windowWidget.addMenuItem({ label: 'Debug', callback: this.onDebugMenuClick.bind(this) })
	}

	hide() {
		this.#windowWidget.hide();
	}

	windowVisibilityToggle() {
		this.#windowWidget.windowVisibilityToggle();
	}

	onWindowClose() {
		this.#os.closeAndExit();
	}

	on_exit() {
		Object.keys(this).forEach(key => this[key] = null);
	}
}